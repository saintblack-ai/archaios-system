import { pathToFileURL } from 'node:url';
import { PRODUCTION_API_URL, BACKEND_WORKER_NAME } from '../shared/production-config.js';

// Configuration declarations are evidence of configuration, never proof of a working flow.
export function assessHealth(status, body, expectedService = BACKEND_WORKER_NAME) {
  const serviceAvailable = status === 200 && body?.ok === true && body?.service === expectedService;
  const blockers = [];
  if (!serviceAvailable) blockers.push('Canonical backend availability or identity was not verified.');
  if (typeof body?.release !== 'string' || !body.release.trim()) blockers.push('Release identifier is missing.');
  if (body?.dependencies?.supabase !== 'configured') blockers.push('Backend auth/persistence configuration is inactive or unknown.');
  const stripe = body?.dependencies?.stripe;
  if (!['configured', 'test_or_configured'].includes(stripe)) blockers.push('Checkout configuration is inactive or unknown.');
  return {
    serviceAvailable,
    paidReadiness: blockers.length ? 'blocked' : 'unverified',
    release: typeof body?.release === 'string' ? body.release : null,
    dependencies: {
      supabase: typeof body?.dependencies?.supabase === 'string' ? body.dependencies.supabase : 'unknown',
      stripe: typeof stripe === 'string' ? stripe : 'unknown'
    },
    blockers,
    remainingVerification: [
      'Browser sign-in and bearer-token rejection/acceptance.',
      'Stripe account mode, actual price IDs, amounts and currency.',
      'Authorized test checkout and signed webhook persistence/tier enforcement.',
      'Live source timestamps, degraded-data labels and frontend release alignment.'
    ]
  };
}

export async function inspectService({ apiUrl = PRODUCTION_API_URL, fetchImpl = fetch } = {}) {
  const endpoint = new URL('/api/health', apiUrl);
  try {
    const response = await fetchImpl(endpoint, { method: 'GET', signal: AbortSignal.timeout(15_000) });
    const body = await response.json();
    return { checkedAt: new Date().toISOString(), endpoint: endpoint.href, ...assessHealth(response.status, body) };
  } catch {
    // Do not print arbitrary response/error content: operational diagnostics must not leak credentials.
    return {
      checkedAt: new Date().toISOString(), endpoint: endpoint.href,
      ...assessHealth(0, null),
      transportError: 'Health request failed or returned invalid JSON; availability is unverified.'
    };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await inspectService();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.paidReadiness === 'blocked' ? 1 : 2;
}
