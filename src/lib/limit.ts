/**
 * A tiny in-memory rate limiter for public forms. It resets when the server
 * restarts, which is fine for one small server — it only needs to stop floods.
 */
const buckets = new Map<string, number[]>();

/** Records a hit and says whether the caller is still under `max` per window. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);

  // Keep the map from growing forever.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) if (!times.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}
