/** Small, strict readers for admin form posts. */

export class FormError extends Error {}

export function text(form: FormData, name: string, opts: { max?: number; required?: string } = {}): string {
  const value = String(form.get(name) ?? "").trim().slice(0, opts.max ?? 2000);
  if (opts.required && !value) throw new FormError(opts.required);
  return value;
}

export function int(form: FormData, name: string, opts: { min?: number; max?: number; fallback?: number } = {}): number {
  const n = Number.parseInt(String(form.get(name) ?? ""), 10);
  const value = Number.isFinite(n) ? n : (opts.fallback ?? 0);
  return Math.min(opts.max ?? Number.MAX_SAFE_INTEGER, Math.max(opts.min ?? 0, value));
}

export const flag = (form: FormData, name: string) => (form.get(name) === "on" ? 1 : 0);

export function oneOf<T extends string>(form: FormData, name: string, allowed: readonly T[], fallback: T): T {
  const value = String(form.get(name) ?? "") as T;
  return allowed.includes(value) ? value : fallback;
}

export function date(form: FormData, name: string): string {
  const value = text(form, name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new FormError("Pick a valid date.");
  return value;
}

export function time(form: FormData, name: string): string {
  const value = text(form, name);
  if (!/^\d{2}:\d{2}$/.test(value)) throw new FormError("Pick a valid time.");
  return value;
}

/** Builds a redirect target carrying a one-shot status message. */
export function back(path: string, status: { saved?: string; error?: string }): string {
  const url = new URL(path, "http://x");
  if (status.saved) url.searchParams.set("saved", status.saved);
  if (status.error) url.searchParams.set("error", status.error);
  return url.pathname + url.search;
}
