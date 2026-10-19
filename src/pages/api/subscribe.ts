import type { APIRoute } from "astro";
import { addSubscriber } from "../../lib/content";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Footer sign-up. Answers JSON for the enhanced form, and redirects back for
 * the plain HTML form (no-JS) so it works either way.
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const wantsJson = request.headers.get("accept")?.includes("application/json");

  // Honeypot: real people never fill the hidden "website" field.
  const spam = String(form.get("website") ?? "") !== "";

  let status: "added" | "exists" | "invalid" = "invalid";
  if (!spam && EMAIL.test(email)) status = addSubscriber(email);
  if (spam) status = "added"; // look successful, store nothing

  if (wantsJson) {
    return new Response(JSON.stringify({ status }), {
      status: status === "invalid" ? 400 : 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return redirect(`/?list=${status}#list`, 303);
};
