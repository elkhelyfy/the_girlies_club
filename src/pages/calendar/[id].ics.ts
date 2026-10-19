import type { APIRoute } from "astro";
import { TIME_ZONE } from "../../lib/content";
import { publicEvent } from "../../lib/bookings";

/** "Add to my calendar" for one workshop, as a standard .ics file. */
export const GET: APIRoute = async ({ params, url, locals }) => {
  const event = await publicEvent(Number(params.id));
  if (!event) return new Response("Not found", { status: 404 });

  const stamp = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  // RFC 5545: escape \ ; , and newlines in text values.
  const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/[;,]/g, "\\$&").replace(/\n/g, "\\n");
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

  // The street address only goes out if the location is marked public.
  const place = [event.location || "", "Casablanca"].filter(Boolean).join(", ");

  const description = [
    event.blurb,
    `${event.price} DH per seat — reserve at ${new URL(`/reserve/${event.id}`, url).href}`,
    `Questions? ${locals.settings.dmUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Girlies Club//Workshops//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@${url.host}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${TIME_ZONE}:${stamp(event.date, event.start_time)}`,
    `DTEND;TZID=${TIME_ZONE}:${stamp(event.date, event.end_time)}`,
    `SUMMARY:${esc(`${event.name} · The Girlies Club`)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(place)}`,
    `STATUS:${event.phase === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    `URL:${new URL(`/calendar#event-${event.id}`, url).href}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="girlies-${event.id}.ics"`,
    },
  });
};
