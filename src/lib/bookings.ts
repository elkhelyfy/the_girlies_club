import { randomInt } from "node:crypto";
import { all, exec, get, transaction, type Runner } from "./db";
import { todayISO, type Settings } from "./content";
import { longDay } from "./dates";

/* ==========================================================================
   Statuses
   ========================================================================== */

/** What the team sets on an event. */
export const EVENT_STATUS = {
  draft: { label: "Draft", hint: "Hidden from the site while you prepare it" },
  open: { label: "Open", hint: "On the site and taking reservations" },
  closed: { label: "Bookings closed", hint: "Still on the site, but no new reservations" },
  cancelled: { label: "Cancelled", hint: "Shown as cancelled on the calendar" },
  done: { label: "Done", hint: "It happened — moves to past events" },
} as const;
export type EventStatus = keyof typeof EVENT_STATUS;
export const EVENT_STATUS_KEYS = Object.keys(EVENT_STATUS) as EventStatus[];

/**
 * What an event actually *is* right now, combining its status with the date
 * and the seats left. "Full" and "Done" happen on their own.
 */
export const PHASE = {
  draft: { label: "Draft", color: "#6b7280", soft: "#f3f4f6" },
  open: { label: "Open", color: "#15803d", soft: "#dcfce7" },
  full: { label: "Full", color: "#c2185b", soft: "#fce7f3" },
  closed: { label: "Bookings closed", color: "#b45309", soft: "#fef3c6" },
  cancelled: { label: "Cancelled", color: "#b91c1c", soft: "#fee2e2" },
  done: { label: "Done", color: "#4b5563", soft: "#e5e7eb" },
} as const;
export type Phase = keyof typeof PHASE;

export const RESERVATION_STATUS = {
  pending: { label: "New request", color: "#b45309", soft: "#fef3c6", holdsSeat: true },
  confirmed: { label: "Confirmed", color: "#15803d", soft: "#dcfce7", holdsSeat: true },
  waitlist: { label: "Wait list", color: "#2b4cf5", soft: "#dbeafe", holdsSeat: false },
  attended: { label: "Came 🌸", color: "#7e22ce", soft: "#f3e8ff", holdsSeat: true },
  no_show: { label: "No-show", color: "#4b5563", soft: "#e5e7eb", holdsSeat: false },
  cancelled: { label: "Cancelled", color: "#b91c1c", soft: "#fee2e2", holdsSeat: false },
} as const;
export type ReservationStatus = keyof typeof RESERVATION_STATUS;
export const RESERVATION_STATUS_KEYS = Object.keys(RESERVATION_STATUS) as ReservationStatus[];
const HOLDING = RESERVATION_STATUS_KEYS.filter((k) => RESERVATION_STATUS[k].holdsSeat);
const HOLDING_SQL = HOLDING.map((s) => `'${s}'`).join(",");

export const PAYMENT = {
  unpaid: { label: "Not paid", color: "#4b5563", soft: "#f3f4f6" },
  deposit: { label: "Deposit", color: "#b45309", soft: "#fef3c6" },
  paid: { label: "Paid", color: "#15803d", soft: "#dcfce7" },
} as const;
export type Payment = keyof typeof PAYMENT;
export const PAYMENT_KEYS = Object.keys(PAYMENT) as Payment[];

export const SOURCES = {
  website: "Website",
  instagram: "Instagram DM",
  whatsapp: "WhatsApp",
  phone: "Phone call",
  walk_in: "Walk-in",
  other: "Other",
} as const;
export type Source = keyof typeof SOURCES;
export const SOURCE_KEYS = Object.keys(SOURCES) as Source[];

/** Most seats one person can request online. The team can add more by hand. */
export const MAX_SEATS_ONLINE = 4;

/* ==========================================================================
   Locations
   ========================================================================== */

export type Location = {
  id: number;
  name: string;
  area: string;
  address: string;
  maps_url: string;
  capacity: number | null;
  notes: string;
  public_address: number;
  active: number;
  event_count?: number;
  upcoming_count?: number;
};

export function locations(opts: { includeInactive?: boolean } = {}): Promise<Location[]> {
  return all<Location>(
    `SELECT l.*,
      (SELECT COUNT(*) FROM events e WHERE e.location_id = l.id)::int AS event_count,
      (SELECT COUNT(*) FROM events e WHERE e.location_id = l.id AND e.date >= ? AND e.status IN ('open','closed'))::int AS upcoming_count
     FROM locations l ${opts.includeInactive ? "" : "WHERE l.active = 1"}
     ORDER BY l.active DESC, lower(l.name)`,
    [todayISO()],
  );
}

export const getLocation = (id: number) => get<Location>("SELECT * FROM locations WHERE id = ?", [id]);

export type LocationInput = Omit<Location, "id" | "event_count" | "upcoming_count">;

export async function saveLocation(id: number | null, l: LocationInput): Promise<number> {
  const values = [l.name, l.area, l.address, l.maps_url, l.capacity, l.notes, l.public_address, l.active];
  if (id) {
    await exec(
      "UPDATE locations SET name=?, area=?, address=?, maps_url=?, capacity=?, notes=?, public_address=?, active=? WHERE id=?",
      [...values, id],
    );
    return id;
  }
  const row = await get<{ id: number }>(
    "INSERT INTO locations (name, area, address, maps_url, capacity, notes, public_address, active) VALUES (?,?,?,?,?,?,?,?) RETURNING id",
    values,
  );
  return row!.id;
}

/** Events that used it keep their details; they just lose the location. */
export const deleteLocation = (id: number) => exec("DELETE FROM locations WHERE id = ?", [id]);

/** The label visitors see: "Studio Rose · Maarif". */
export function publicPlace(e: Pick<EventRow, "location_name" | "location_area" | "location_address" | "location_public">) {
  if (!e.location_name) return "";
  const where = e.location_public && e.location_address ? e.location_address : e.location_area;
  return [e.location_name, where].filter(Boolean).join(" · ");
}

/* ==========================================================================
   Events
   ========================================================================== */

type EventTable = {
  id: number;
  name: string;
  craft: string;
  level: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  held_seats: number;
  price: number;
  blurb: string;
  image: string | null;
  alt: string;
  tone: string;
  is_new: number;
  status: EventStatus;
  location_id: number | null;
  notes: string;
};

export type EventRow = EventTable & {
  location_name: string | null;
  location_area: string | null;
  location_address: string | null;
  location_maps_url: string | null;
  location_public: number | null;
  /** Seats taken by reservations that hold a seat (new, confirmed, came). */
  booked: number;
  pending_count: number;
  waitlist_count: number;
  /* computed */
  seats_left: number;
  phase: Phase;
  /** Public place label, or "" if no location is set. */
  location: string;
};

const EVENT_SELECT = `
  SELECT e.*,
    l.name AS location_name, l.area AS location_area, l.address AS location_address,
    l.maps_url AS location_maps_url, l.public_address AS location_public,
    COALESCE(r.booked, 0) AS booked,
    COALESCE(r.pending, 0) AS pending_count,
    COALESCE(r.waitlist, 0) AS waitlist_count
  FROM events e
  LEFT JOIN locations l ON l.id = e.location_id
  LEFT JOIN (
    SELECT event_id,
      SUM(CASE WHEN status IN (${HOLDING_SQL}) THEN seats ELSE 0 END)::int AS booked,
      (COUNT(*) FILTER (WHERE status = 'pending'))::int AS pending,
      (COUNT(*) FILTER (WHERE status = 'waitlist'))::int AS waitlist
    FROM reservations GROUP BY event_id
  ) r ON r.event_id = e.id`;

export function phaseOf(e: { status: EventStatus; date: string; seats_left: number }, today = todayISO()): Phase {
  if (e.status === "draft") return "draft";
  if (e.status === "cancelled") return "cancelled";
  if (e.status === "done" || e.date < today) return "done";
  if (e.status === "closed") return "closed";
  return e.seats_left <= 0 ? "full" : "open";
}

function hydrate(rows: unknown[]): EventRow[] {
  const today = todayISO();
  return (rows as Omit<EventRow, "seats_left" | "phase" | "location">[]).map((row) => {
    const seats_left = Math.max(0, row.capacity - row.held_seats - row.booked);
    const event = { ...row, seats_left } as EventRow;
    event.phase = phaseOf(event, today);
    event.location = publicPlace(event);
    return event;
  });
}

/** What visitors can see: open and closed events, plus cancelled ones on the calendar. */
const PUBLIC = (withCancelled: boolean) => `e.status IN ('open','closed'${withCancelled ? ",'cancelled'" : ""})`;

export async function upcomingEvents(opts: { limit?: number; withCancelled?: boolean } = {}): Promise<EventRow[]> {
  return hydrate(
    await all(`${EVENT_SELECT} WHERE ${PUBLIC(!!opts.withCancelled)} AND e.date >= ? ORDER BY e.date, e.start_time LIMIT ?`, [
      todayISO(),
      opts.limit ?? 500,
    ]),
  );
}

export async function eventsBetween(from: string, to: string): Promise<EventRow[]> {
  return hydrate(await all(`${EVENT_SELECT} WHERE ${PUBLIC(true)} AND e.date BETWEEN ? AND ? ORDER BY e.date, e.start_time`, [from, to]));
}

/** A single event as visitors may see it (never drafts). */
export async function publicEvent(id: number): Promise<EventRow | undefined> {
  return hydrate(await all(`${EVENT_SELECT} WHERE e.id = ? AND ${PUBLIC(true)}`, [id]))[0];
}

export async function getEvent(id: number, run?: Runner): Promise<EventRow | undefined> {
  return hydrate(await all(`${EVENT_SELECT} WHERE e.id = ?`, [id], run))[0];
}

export const EVENT_VIEWS = {
  upcoming: "Upcoming",
  past: "Past",
  draft: "Drafts",
  cancelled: "Cancelled",
  all: "All",
} as const;
export type EventView = keyof typeof EVENT_VIEWS;

/** Each view as a condition; `$1` is today's date. */
const VIEW_WHERE: Record<EventView, string> = {
  upcoming: "e.status IN ('open','closed') AND e.date >= $1",
  past: "(e.status = 'done' OR (e.status IN ('open','closed') AND e.date < $1))",
  draft: "e.status = 'draft'",
  cancelled: "e.status = 'cancelled'",
  all: "true",
};
const usesToday = (where: string) => where.includes("$1");

export async function adminEvents(view: EventView): Promise<EventRow[]> {
  const where = VIEW_WHERE[view];
  const order = view === "upcoming" || view === "draft" ? "e.date, e.start_time" : "e.date DESC, e.start_time DESC";
  return hydrate(await all(`${EVENT_SELECT} WHERE ${where} ORDER BY ${order}`, usesToday(where) ? [todayISO()] : []));
}

export async function eventViewCounts(): Promise<Record<EventView, number>> {
  const columns = (Object.keys(VIEW_WHERE) as EventView[])
    .map((view) => `(COUNT(*) FILTER (WHERE ${VIEW_WHERE[view]}))::int AS ${view}`)
    .join(", ");
  const row = await get<Record<EventView, number>>(`SELECT ${columns} FROM events e`, [todayISO()]);
  return row!;
}

export type EventInput = Omit<EventTable, "id">;

export async function saveEvent(id: number | null, e: EventInput): Promise<number> {
  const values = [
    e.name, e.craft, e.level, e.date, e.start_time, e.end_time, e.capacity, e.held_seats, e.price, e.blurb,
    e.image, e.alt, e.tone, e.is_new, e.status, e.location_id, e.notes,
  ];
  if (id) {
    await exec(
      `UPDATE events SET name=?, craft=?, level=?, date=?, start_time=?, end_time=?, capacity=?, held_seats=?, price=?,
        blurb=?, image=?, alt=?, tone=?, is_new=?, status=?, location_id=?, notes=? WHERE id=?`,
      [...values, id],
    );
    return id;
  }
  const row = await get<{ id: number }>(
    `INSERT INTO events (name, craft, level, date, start_time, end_time, capacity, held_seats, price, blurb, image, alt,
      tone, is_new, status, location_id, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,
    values,
  );
  return row!.id;
}

export const setEventStatus = (id: number, status: EventStatus) =>
  exec("UPDATE events SET status = ? WHERE id = ?", [status, id]);

/** Reservations go with it (ON DELETE CASCADE). */
export const deleteEvent = (id: number) => exec("DELETE FROM events WHERE id = ?", [id]);

/** "Run it again": same workshop one week later, as a draft with no bookings. */
export async function duplicateEvent(id: number): Promise<number | null> {
  const e = await getEvent(id);
  if (!e) return null;
  const next = new Date(`${e.date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 7);
  return saveEvent(null, {
    name: e.name, craft: e.craft, level: e.level, date: next.toISOString().slice(0, 10),
    start_time: e.start_time, end_time: e.end_time, capacity: e.capacity, held_seats: 0, price: e.price,
    blurb: e.blurb, image: e.image, alt: e.alt, tone: e.tone, is_new: 0, status: "draft",
    location_id: e.location_id, notes: e.notes,
  });
}

/* ==========================================================================
   Reservations
   ========================================================================== */

export type Reservation = {
  id: number;
  code: string;
  event_id: number;
  name: string;
  phone: string;
  instagram: string;
  email: string;
  seats: number;
  status: ReservationStatus;
  payment: Payment;
  source: Source;
  message: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

export type ReservationWithEvent = Reservation & {
  event_name: string;
  event_date: string;
  event_start: string;
  event_price: number;
  event_status: EventStatus;
};

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

async function newCode(run: Runner): Promise<string> {
  for (;;) {
    const code = `GC-${Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("")}`;
    if (!(await get("SELECT 1 FROM reservations WHERE code = ?", [code], run))) return code;
  }
}

export const reservationsForEvent = (eventId: number) =>
  all<Reservation>(
    `SELECT * FROM reservations WHERE event_id = ?
     ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'confirmed' THEN 1 WHEN 'attended' THEN 2
       WHEN 'waitlist' THEN 3 WHEN 'no_show' THEN 4 ELSE 5 END, created_at, id`,
    [eventId],
  );

export const getReservation = (id: number) => get<Reservation>("SELECT * FROM reservations WHERE id = ?", [id]);

export const findReservation = (eventId: number, code: string) =>
  get<Reservation>("SELECT * FROM reservations WHERE event_id = ? AND code = ?", [eventId, code.toUpperCase()]);

export type ReservationFilter = {
  status?: ReservationStatus | "all";
  q?: string;
  when?: "upcoming" | "past" | "all";
};

export function listReservations(f: ReservationFilter = {}): Promise<ReservationWithEvent[]> {
  const where: string[] = [];
  const params: string[] = [];
  if (f.status && f.status !== "all") {
    where.push("r.status = ?");
    params.push(f.status);
  }
  if (f.when === "upcoming") where.push("e.date >= ?");
  if (f.when === "past") where.push("e.date < ?");
  if (f.when === "upcoming" || f.when === "past") params.push(todayISO());
  if (f.q?.trim()) {
    const fields = ["r.name", "r.phone", "r.instagram", "r.email", "r.code", "e.name"];
    const match = fields.map((field) => `${field} ILIKE ?`);
    params.push(...fields.map(() => `%${f.q!.trim()}%`));
    const digits = f.q.replace(/\D/g, "");
    if (digits) {
      match.push("replace(replace(replace(r.phone, ' ', ''), '-', ''), '+', '') LIKE ?");
      params.push(`%${digits}%`);
    }
    where.push(`(${match.join(" OR ")})`);
  }
  return all<ReservationWithEvent>(
    `SELECT r.*, e.name AS event_name, e.date AS event_date, e.start_time AS event_start, e.price AS event_price,
      e.status AS event_status
     FROM reservations r JOIN events e ON e.id = r.event_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY CASE r.status WHEN 'pending' THEN 0 ELSE 1 END, e.date ${f.when === "past" ? "DESC" : "ASC"}, r.created_at`,
    params,
  );
}

export async function reservationCounts(
  when: ReservationFilter["when"] = "upcoming",
): Promise<Record<ReservationStatus | "all", number>> {
  const clause = when === "upcoming" ? "WHERE e.date >= ?" : when === "past" ? "WHERE e.date < ?" : "";
  const rows = await all<{ status: ReservationStatus; n: number }>(
    `SELECT r.status, COUNT(*)::int AS n FROM reservations r JOIN events e ON e.id = r.event_id ${clause} GROUP BY r.status`,
    clause ? [todayISO()] : [],
  );
  const counts = Object.fromEntries(RESERVATION_STATUS_KEYS.map((k) => [k, 0])) as Record<ReservationStatus | "all", number>;
  counts.all = 0;
  for (const row of rows) {
    counts[row.status] = row.n;
    counts.all += row.n;
  }
  return counts;
}

export type ReservationInput = Pick<
  Reservation,
  "name" | "phone" | "instagram" | "email" | "seats" | "status" | "payment" | "source" | "message" | "admin_notes"
>;

export class BookingError extends Error {}

/**
 * Adds a reservation. Seat-holding statuses are checked against the seats
 * left inside one transaction, so two people can't take the last seat.
 * Online requests that don't fit become wait-list entries instead.
 */
export function createReservation(
  eventId: number,
  input: ReservationInput,
  opts: { online?: boolean } = {},
): Promise<{ id: number; code: string; status: ReservationStatus }> {
  return transaction(async (run) => {
    // Lock the event row so concurrent bookings for it wait their turn.
    await exec("SELECT id FROM events WHERE id = ? FOR UPDATE", [eventId], run);
    const event = await getEvent(eventId, run);
    if (!event) throw new BookingError("That event doesn't exist any more.");

    let status = input.status;
    if (opts.online) {
      if (event.phase === "closed" || event.phase === "cancelled" || event.phase === "done" || event.phase === "draft") {
        throw new BookingError("This session isn't taking reservations any more.");
      }
      if (input.seats > event.seats_left) status = "waitlist";
    }

    const code = await newCode(run);
    const row = await get<{ id: number }>(
      `INSERT INTO reservations (code, event_id, name, phone, instagram, email, seats, status, payment, source, message, admin_notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,
      [
        code, eventId, input.name, input.phone, input.instagram, input.email, input.seats, status,
        input.payment, input.source, input.message, input.admin_notes,
      ],
      run,
    );
    return { id: row!.id, code, status };
  });
}

export async function updateReservation(id: number, patch: Partial<ReservationInput> & { event_id?: number }) {
  const current = await getReservation(id);
  if (!current) return;
  const next = { ...current, ...patch };
  await exec(
    `UPDATE reservations SET event_id=?, name=?, phone=?, instagram=?, email=?, seats=?, status=?, payment=?, source=?,
      message=?, admin_notes=?, updated_at=to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') WHERE id=?`,
    [
      next.event_id, next.name, next.phone, next.instagram, next.email, next.seats, next.status, next.payment, next.source,
      next.message, next.admin_notes, id,
    ],
  );
}

export const deleteReservation = (id: number) => exec("DELETE FROM reservations WHERE id = ?", [id]);

/* ==========================================================================
   People — everyone who has booked, grouped by phone, Instagram or email
   ========================================================================== */

export type Person = {
  key: string;
  name: string;
  phone: string;
  instagram: string;
  email: string;
  bookings: number;
  attended: number;
  noShows: number;
  upcoming: number;
  lastEvent: { name: string; date: string } | null;
  firstSeen: string;
};

export function personKey(r: Pick<Reservation, "phone" | "instagram" | "email" | "name">): string {
  const digits = r.phone.replace(/\D/g, "").replace(/^(00)?212/, "0");
  if (digits.length >= 6) return `tel:${digits}`;
  if (r.instagram) return `ig:${r.instagram.toLowerCase()}`;
  if (r.email) return `mail:${r.email.toLowerCase()}`;
  return `name:${r.name.trim().toLowerCase()}`;
}

export async function people(q = ""): Promise<Person[]> {
  const today = todayISO();
  const rows = (await listReservations({ when: "all" })).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const map = new Map<string, Person>();
  for (const r of rows) {
    const key = personKey(r);
    const p = map.get(key) ?? {
      key, name: r.name, phone: "", instagram: "", email: "", bookings: 0, attended: 0, noShows: 0, upcoming: 0,
      lastEvent: null, firstSeen: r.created_at,
    };
    // Latest details win, but never blank out something we already know.
    p.name = r.name || p.name;
    p.phone = r.phone || p.phone;
    p.instagram = r.instagram || p.instagram;
    p.email = r.email || p.email;
    if (r.status !== "cancelled") p.bookings += 1;
    if (r.status === "attended") p.attended += 1;
    if (r.status === "no_show") p.noShows += 1;
    if (r.event_date >= today && RESERVATION_STATUS[r.status].holdsSeat) p.upcoming += 1;
    if (r.status !== "cancelled" && (!p.lastEvent || r.event_date > p.lastEvent.date)) {
      p.lastEvent = { name: r.event_name, date: r.event_date };
    }
    map.set(key, p);
  }
  const needle = q.trim().toLowerCase();
  return [...map.values()]
    .filter((p) => !needle || [p.name, p.phone, p.instagram, p.email].some((v) => v.toLowerCase().includes(needle)))
    .sort((a, b) => b.attended - a.attended || b.bookings - a.bookings || a.name.localeCompare(b.name));
}

/* ==========================================================================
   Contact helpers
   ========================================================================== */

/** "06 12 34 56 78" → "212612345678" for wa.me links. Moroccan numbers by default. */
export function whatsappNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 10) digits = `212${digits.slice(1)}`;
  return digits.length >= 9 ? digits : null;
}

export function whatsappLink(phone: string, text?: string): string | null {
  const number = whatsappNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** A ready-to-send message for this guest, matched to where her booking is. */
export function guestMessage(r: Reservation, e: EventRow, s: Settings): string {
  const first = r.name.trim().split(/\s+/)[0] || "girlie";
  const when = `${longDay(e.date)}, ${e.start_time}–${e.end_time}`;
  const place = [
    e.location_name ? `📍 ${e.location_name}${e.location_address ? ` — ${e.location_address}` : e.location_area ? ` (${e.location_area})` : ""}` : "",
    e.location_maps_url ?? "",
  ].filter(Boolean);
  const total = `💸 ${r.seats * e.price} DH${r.seats > 1 ? ` (${r.seats} seats)` : ""}`;
  const sign = `See you at the table! 🌸\n— The Girlies Club (${s.handle})`;

  if (e.phase === "cancelled") {
    return [
      `Hi ${first},`,
      `We're so sorry — *${e.name}* on ${when} is cancelled. 💔`,
      `We'd love to see you at another date: reply here and we'll move your seat, or check the calendar.`,
      `Ref: ${r.code}`,
      `— The Girlies Club (${s.handle})`,
    ].join("\n\n");
  }
  if (r.status === "waitlist") {
    return [
      `Hi ${first}! 🌸`,
      `Good news — a seat opened up for *${e.name}* on ${when}.`,
      `Would you like it? Reply yes and it's yours.`,
      `Ref: ${r.code}`,
    ].join("\n\n");
  }
  if (r.status === "cancelled") {
    return [`Hi ${first},`, `About *${e.name}* on ${when}: your reservation (${r.code}) is cancelled.`, `We hope to see you at another session soon 🌸`].join("\n\n");
  }
  const intro =
    r.status === "pending"
      ? `Your ${r.seats > 1 ? `${r.seats} seats are` : "seat is"} confirmed for *${e.name}* — ${when}.`
      : `A little reminder: *${e.name}* is on ${when}.`;
  return [`Hi ${first}! 🌸`, intro, ...place, total, `Ref: ${r.code}`, sign].join("\n\n");
}

/* ==========================================================================
   Overview numbers for the admin home
   ========================================================================== */

export async function bookingStats() {
  const today = todayISO();
  const in30 = new Date(`${today}T12:00:00Z`);
  in30.setUTCDate(in30.getUTCDate() + 30);
  const until = in30.toISOString().slice(0, 10);
  const soon = hydrate(await all(`${EVENT_SELECT} WHERE e.status IN ('open','closed') AND e.date BETWEEN ? AND ?`, [today, until]));
  const paid = (await get<{ total: number }>(
    `SELECT COALESCE(SUM(r.seats * e.price), 0)::int AS total FROM reservations r JOIN events e ON e.id = r.event_id
     WHERE r.payment = 'paid' AND substr(e.date, 1, 7) = substr(?, 1, 7)`,
    [today],
  ))!;
  const pending = (await get<{ n: number }>("SELECT COUNT(*)::int AS n FROM reservations WHERE status = 'pending'"))!;
  return {
    pending: pending.n,
    seatsBooked30: soon.reduce((n, e) => n + e.booked + e.held_seats, 0),
    capacity30: soon.reduce((n, e) => n + e.capacity, 0),
    paidThisMonth: paid.total,
  };
}
