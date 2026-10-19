/**
 * Form handling shared by several admin pages, so every page that shows a
 * reservation (event page, reservations list, overview) behaves the same.
 */
import { CRAFTS, LEVELS, TONES, cleanHandle } from "./content";
import {
  EVENT_STATUS_KEYS,
  PAYMENT_KEYS,
  RESERVATION_STATUS,
  RESERVATION_STATUS_KEYS,
  SOURCE_KEYS,
  createReservation,
  deleteReservation,
  getEvent,
  getReservation,
  updateReservation,
  type EventInput,
  type EventRow,
} from "./bookings";
import { FormError, date, flag, int, oneOf, text, time } from "./forms";
import { imageFromForm } from "./images";

const TONE_KEYS = Object.keys(TONES) as (keyof typeof TONES)[];

/** Only ever bounce back inside /admin. */
export function safeBack(form: FormData, fallback: string): string {
  const back = String(form.get("back") ?? "");
  return back.startsWith("/admin") && !back.startsWith("//") ? back : fallback;
}

/** Adds ?saved= / ?error= to a path that may already have a query string. */
export function withFlash(path: string, flash: { saved?: string; error?: string }): string {
  const url = new URL(path, "http://x");
  url.searchParams.delete("saved");
  url.searchParams.delete("error");
  if (flash.saved) url.searchParams.set("saved", flash.saved);
  if (flash.error) url.searchParams.set("error", flash.error);
  return url.pathname + url.search + url.hash;
}

/* --- events ---------------------------------------------------------------- */

export async function eventFromForm(form: FormData, existing?: EventRow): Promise<EventInput> {
  const start = time(form, "start_time");
  const end = time(form, "end_time");
  if (end <= start) throw new FormError("The end time has to be after the start time.");
  const capacity = int(form, "capacity", { min: 1, max: 500, fallback: 12 });
  const locationId = int(form, "location_id");

  return {
    name: text(form, "name", { max: 120, required: "Give the event a name." }),
    craft: oneOf(form, "craft", CRAFTS, "Crochet"),
    level: oneOf(form, "level", LEVELS, "Beginner"),
    date: date(form, "date"),
    start_time: start,
    end_time: end,
    capacity,
    held_seats: int(form, "held_seats", { min: 0, max: capacity }),
    price: int(form, "price", { min: 0, max: 100000, fallback: 250 }),
    blurb: text(form, "blurb", { max: 400 }),
    image: await imageFromForm(form, "image", existing?.image ?? null),
    alt: text(form, "alt", { max: 200 }),
    tone: oneOf(form, "tone", TONE_KEYS, "blush"),
    is_new: flag(form, "is_new"),
    status: oneOf(form, "status", EVENT_STATUS_KEYS, "draft"),
    location_id: locationId || null,
    notes: text(form, "notes", { max: 2000 }),
  };
}

/* --- reservations ---------------------------------------------------------- */

function guestFromForm(form: FormData) {
  const name = text(form, "name", { max: 80, required: "Add her name." });
  const phone = text(form, "phone", { max: 30 });
  const instagram = cleanHandle(text(form, "instagram", { max: 60 }));
  const email = text(form, "email", { max: 254 }).toLowerCase();
  if (!phone && !instagram && !email) throw new FormError("Add at least one way to reach her: phone, Instagram or email.");
  return { name, phone, instagram, email };
}

/**
 * Handles every reservation action an admin form can post. Returns the flash
 * message to show, or null if the form wasn't a reservation action.
 */
export function handleReservationAction(form: FormData): { saved?: string; error?: string } | null {
  const intent = String(form.get("intent") ?? "");
  if (!intent.startsWith("res-")) return null;

  try {
    if (intent === "res-add") {
      const eventId = int(form, "event_id");
      if (!getEvent(eventId)) throw new FormError("That event doesn't exist.");
      const guest = guestFromForm(form);
      createReservation(eventId, {
        ...guest,
        seats: int(form, "seats", { min: 1, max: 50, fallback: 1 }),
        status: oneOf(form, "status", RESERVATION_STATUS_KEYS, "confirmed"),
        payment: oneOf(form, "payment", PAYMENT_KEYS, "unpaid"),
        source: oneOf(form, "source", SOURCE_KEYS, "instagram"),
        message: "",
        admin_notes: text(form, "admin_notes", { max: 2000 }),
      });
      return { saved: `${guest.name} added.` };
    }

    const id = int(form, "id");
    const current = getReservation(id);
    if (!current) throw new FormError("That reservation doesn't exist any more.");

    switch (intent) {
      case "res-status": {
        const status = oneOf(form, "status", RESERVATION_STATUS_KEYS, current.status);
        updateReservation(id, { status });
        return { saved: `${current.name}: ${RESERVATION_STATUS[status].label.replace(/ 🌸$/, "")}.` };
      }
      case "res-payment": {
        updateReservation(id, { payment: oneOf(form, "payment", PAYMENT_KEYS, current.payment) });
        return { saved: `Payment updated for ${current.name}.` };
      }
      case "res-save": {
        const eventId = int(form, "event_id", { fallback: current.event_id });
        if (!getEvent(eventId)) throw new FormError("Pick an event that exists.");
        updateReservation(id, {
          ...guestFromForm(form),
          event_id: eventId,
          seats: int(form, "seats", { min: 1, max: 50, fallback: current.seats }),
          status: oneOf(form, "status", RESERVATION_STATUS_KEYS, current.status),
          payment: oneOf(form, "payment", PAYMENT_KEYS, current.payment),
          source: oneOf(form, "source", SOURCE_KEYS, current.source),
          admin_notes: text(form, "admin_notes", { max: 2000 }),
        });
        return { saved: eventId !== current.event_id ? `${current.name} moved to another event.` : `${current.name} updated.` };
      }
      case "res-delete": {
        deleteReservation(id);
        return { saved: `${current.name}'s reservation deleted.` };
      }
    }
    return { error: "Unknown action." };
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}
