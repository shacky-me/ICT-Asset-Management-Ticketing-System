// Small in-memory fixed-window counter. Keys are account identifiers
// (email, request id) rather than IP addresses: behind Tailscale Funnel
// every visitor reaches the server from the same local address.
// Counts reset when the server restarts, which is acceptable here.

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

function current(key: string, windowMs: number): Window {
  const now = Date.now();
  const existing = windows.get(key);
  if (existing && existing.resetAt > now) return existing;
  const fresh = { count: 0, resetAt: now + windowMs };
  windows.set(key, fresh);
  return fresh;
}

// True when the key has already reached `limit` hits in the current window.
export function isLimited(key: string, limit: number, windowMs: number): boolean {
  return current(key, windowMs).count >= limit;
}

export function recordHit(key: string, windowMs: number): void {
  current(key, windowMs).count += 1;
}

// Records a hit and reports whether it was allowed.
export function tryConsume(key: string, limit: number, windowMs: number): boolean {
  const window = current(key, windowMs);
  if (window.count >= limit) return false;
  window.count += 1;
  return true;
}

export function clearKey(key: string): void {
  windows.delete(key);
}

export function minutesUntilReset(key: string): number {
  const window = windows.get(key);
  if (!window) return 0;
  return Math.max(1, Math.ceil((window.resetAt - Date.now()) / 60000));
}

// Drop expired windows now and then so the map does not grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}, 10 * 60 * 1000).unref();
