import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";
import { ADMIN_CODE } from "astro:env/server";
import { exec, get } from "./db";

/**
 * /admin is unlocked by the ADMIN_CODE environment variable. A correct code earns a signed,
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
   in the database so every server instance shares the same count. */

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;

export async function lockedFor(ip: string): Promise<number> {
  const entry = await get<{ count: number; until: string }>("SELECT count, until FROM login_attempts WHERE ip = ?", [ip]);
  const until = Number(entry?.until ?? 0);
  if (!entry || until < Date.now()) return 0;
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((until - Date.now()) / 60_000) : 0;
}

export async function recordFailure(ip: string) {
  const now = Date.now();
  // A fresh window starts once the previous one has run out.
  await exec(
    `INSERT INTO login_attempts (ip, count, until) VALUES (?, 1, ?)
     ON CONFLICT (ip) DO UPDATE SET
       count = CASE WHEN login_attempts.until::bigint < ? THEN 1 ELSE login_attempts.count + 1 END,
       until = CASE WHEN login_attempts.until::bigint < ? THEN excluded.until ELSE login_attempts.until END`,
    [ip, String(now + WINDOW_MS), now, now],
  );
}

export const clearFailures = (ip: string) => exec("DELETE FROM login_attempts WHERE ip = ?", [ip]);
