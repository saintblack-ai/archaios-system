import test from 'node:test';
import assert from 'node:assert/strict';
import { assessHealth, inspectService } from '../scripts/assess-service-readiness.mjs';

const health = { ok: true, service: 'archaios-core-api', release: 'fixture', dependencies: { supabase: 'configured', stripe: 'test_or_configured' } };

test('HTTP 200 with inactive dependencies is available but blocks paid readiness', () => {
  const report = assessHealth(200, { ...health, dependencies: { supabase: 'inactive', stripe: 'test_or_inactive' } });
  assert.equal(report.serviceAvailable, true);
  assert.equal(report.paidReadiness, 'blocked');
  assert.equal(report.blockers.length, 2);
});
test('configured dependencies never prove a paid flow or live Stripe mode', () => {
  const report = assessHealth(200, health);
  assert.equal(report.paidReadiness, 'unverified');
  assert.equal(report.blockers.length, 0);
  assert.equal(report.remainingVerification.length, 4);
});
test('unknown dependency states and missing release fail closed', () => {
  for (const body of [null, {}, { ...health, release: '' }, { ...health, dependencies: {} }]) {
    assert.equal(assessHealth(200, body).paidReadiness, 'blocked');
  }
});
test('wrong backend identity, non-200 and ok=false cannot verify availability', () => {
  assert.equal(assessHealth(200, { ...health, service: 'other' }).serviceAvailable, false);
  assert.equal(assessHealth(503, health).serviceAvailable, false);
  assert.equal(assessHealth(200, { ...health, ok: false }).serviceAvailable, false);
});
test('inspection makes only a health GET and excludes arbitrary payload fields', async () => {
  let calls = 0;
  const result = await inspectService({ apiUrl: 'https://example.test', fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url.href, 'https://example.test/api/health');
    assert.equal(options.method, 'GET');
    assert.ok(options.signal);
    return Response.json({ ...health, secret: 'must-not-appear' });
  } });
  assert.equal(calls, 1);
  assert.equal(result.serviceAvailable, true);
  assert.ok(!JSON.stringify(result).includes('must-not-appear'));
});
test('network and malformed JSON errors return controlled blocked reports', async () => {
  for (const fetchImpl of [async () => { throw Error('sensitive details'); }, async () => new Response('<html>')]) {
    const report = await inspectService({ fetchImpl });
    assert.equal(report.serviceAvailable, false);
    assert.equal(report.paidReadiness, 'blocked');
    assert.ok(report.transportError);
    assert.ok(!JSON.stringify(report).includes('sensitive details'));
  }
});
