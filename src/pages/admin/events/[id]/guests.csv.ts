import type { APIRoute } from "astro";
import { PAYMENT, RESERVATION_STATUS, SOURCES, getEvent, reservationsForEvent } from "../../../../lib/bookings";

/** The guest list for one event — for printing, or the door. Admin-only via middleware. */
export const GET: APIRoute = async ({ params }) => {
  const event = await getEvent(Number(params.id));
  if (!event) return new Response("Not found", { status: 404 });

  // Quote every cell, and defuse leading = + - @ so spreadsheets don't run it.
  const cell = (value: string | number) => `"${String(value).replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
  const rows: (string | number)[][] = [
    ["name", "phone", "instagram", "email", "seats", "status", "payment", "amount_dh", "booked_via", "code", "message", "notes", "booked_at_utc"],
    ...(await reservationsForEvent(event.id)).map((r) => [
      r.name, r.phone, r.instagram, r.email, r.seats,
      RESERVATION_STATUS[r.status].label.replace(/ 🌸$/, ""), PAYMENT[r.payment].label, r.seats * event.price,
      SOURCES[r.source], r.code, r.message, r.admin_notes, r.created_at,
    ]),
  ];
  const csv = "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n"); // BOM so Excel reads accents

  const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.date}-${slug || "event"}-guests.csv"`,
    },
  });
};
