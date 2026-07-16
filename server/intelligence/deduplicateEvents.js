export function deduplicateEvents(events = []) {
  const seen = new Set();
  const deduped = [];

  for (const event of events) {
    const key = event.id || event.raw_payload_hash;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(event);
  }

  return deduped;
}
