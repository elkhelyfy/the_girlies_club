import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";
import { ADMIN_CODE } from "astro:env/server";

/**
 * /admin is unlocked by ADMIN_CODE from .env. A correct code earns a signed,
 * httpOnly cookie: `<expiry>.<hmac>`. The HMAC key is derived from the code
 * itself, so changing ADMIN_CODE logs every session out.
 */

export const COOKIE = "girlies_admin";
const SESSION_HOURS = 12;

export const adminEnabled = () => Boolean(ADMIN_CODE && ADMIN_CODE.length >= 6);

const key = () => createHash("sha256").update(`girlies-admin:${ADMIN_CODE}`).digest();
const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");

function safeEqual(a: string, b: string): boolean {
  // Hash first so the comparison is constant-time even for different lengths.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCode(attempt: string): boolean {
  if (!adminEnabled()) return false;
  return safeEqual(attempt.trim(), ADMIN_CODE!);
}

export function startSession(cookies: AstroCookies, secure: boolean) {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const payload = String(expires);
  cookies.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    expires: new Date(expires),
  });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: "/" });
}

export function isAuthed(cookies: AstroCookies): boolean {
  if (!adminEnabled()) return false;
  const value = cookies.get(COOKIE)?.value;
  if (!value) return false;
  const [payload, mac] = value.split(".");
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return false;
  return Number(payload) > Date.now();
}

/* --- login throttling ------------------------------------------------------
   Five wrong codes from one address locks it out for fifteen minutes. Kept
   in memory: it resets on restart, which is fine for a single small server. */

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; until: number }>();

export function lockedFor(ip: string): number {
  const entry = attempts.get(ip);
  if (!entry || entry.until < Date.now()) return 0;
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((entry.until - Date.now()) / 60_000) : 0;
}

export function recordFailure(ip: string) {
  const entry = attempts.get(ip);
  if (!entry || entry.until < Date.now()) attempts.set(ip, { count: 1, until: Date.now() + WINDOW_MS });
  else entry.count += 1;
}

export const clearFailures = (ip: string) => attempts.delete(ip);
