import { defineMiddleware } from "astro:middleware";
import { isAuthed } from "./lib/auth";
import { getSettings } from "./lib/content";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Editable site text, read once per page request (one small query).
  if (!pathname.startsWith("/media/") && !pathname.startsWith("/_image")) {
    context.locals.settings = await getSettings();
  }

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdmin) return next();

  // Everything under /admin except the login page needs a valid session.
  if (pathname !== "/admin/login" && !isAuthed(context.cookies)) {
    return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  const response = await next();
  // Never cache admin pages or let them be indexed.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
});
