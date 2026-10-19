import { sql } from "drizzle-orm";
import { index, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Everything the admin can edit lives here. Timestamps are stored as UTC text
 * ("YYYY-MM-DD HH:MM:SS") so they sort and compare as plain strings, and
 * yes/no fields are 0/1 integers.
 */

const now = sql`to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS')`;

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});

/** Uploaded photos. The bytes live in Netlify Blobs under the same id. */
export const media = pgTable("media", {
  id: serial().primaryKey(),
  mime: text().notNull(),
  createdAt: text("created_at").notNull().default(now),
});

export const locations = pgTable("locations", {
  id: serial().primaryKey(),
  name: text().notNull(),
  area: text().notNull().default(""), // neighbourhood, shown publicly
  address: text().notNull().default(""), // sent on confirmation
  mapsUrl: text("maps_url").notNull().default(""),
  capacity: integer(), // a hint for new events
  notes: text().notNull().default(""), // private: door code, parking…
  publicAddress: integer("public_address").notNull().default(0), // show the street address on the site
  active: integer().notNull().default(1),
  createdAt: text("created_at").notNull().default(now),
});

export const events = pgTable(
  "events",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    craft: text().notNull(),
    level: text().notNull().default("Beginner"),
    date: text().notNull(), // YYYY-MM-DD, Casablanca time
    startTime: text("start_time").notNull(), // HH:MM
    endTime: text("end_time").notNull(), // HH:MM
    capacity: integer().notNull().default(12),
    heldSeats: integer("held_seats").notNull().default(0), // seats taken outside the site
    price: integer().notNull().default(250),
    blurb: text().notNull().default(""),
    image: text(), // asset:<key> | media:<id> | NULL
    alt: text().notNull().default(""),
    tone: text().notNull().default("blush"),
    isNew: integer("is_new").notNull().default(0),
    status: text().notNull().default("open"), // draft | open | closed | cancelled | done
    locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
    notes: text().notNull().default(""), // private, admin only
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("events_date").on(t.date, t.startTime)],
);

export const reservations = pgTable(
  "reservations",
  {
    id: serial().primaryKey(),
    code: text().notNull().unique(), // short reference, e.g. GC-7K2P
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text().notNull(),
    phone: text().notNull().default(""),
    instagram: text().notNull().default(""),
    email: text().notNull().default(""),
    seats: integer().notNull().default(1),
    status: text().notNull().default("pending"), // pending | confirmed | waitlist | attended | no_show | cancelled
    payment: text().notNull().default("unpaid"), // unpaid | deposit | paid
    source: text().notNull().default("website"),
    message: text().notNull().default(""), // from the guest
    adminNotes: text("admin_notes").notNull().default(""), // private
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [
    index("reservations_event").on(t.eventId, t.status),
    index("reservations_status").on(t.status, t.createdAt),
  ],
);

export const wallPosts = pgTable("wall_posts", {
  id: serial().primaryKey(),
  image: text().notNull(),
  alt: text().notNull().default(""),
  instagram: text().notNull(), // username, no @
  title: text().notNull().default(""), // e.g. "Beanie Night, Dec"
  craft: text().notNull().default("Crochet"),
  featured: integer().notNull().default(0),
  tall: integer().notNull().default(0),
  published: integer().notNull().default(1),
  createdAt: text("created_at").notNull().default(now),
});

export const testimonials = pgTable("testimonials", {
  id: serial().primaryKey(),
  quote: text().notNull(),
  name: text().notNull(),
  role: text().notNull().default(""),
  avatar: text(),
  tone: text().notNull().default("blush"),
  position: integer().notNull().default(0),
  published: integer().notNull().default(1),
});

export const faqs = pgTable("faqs", {
  id: serial().primaryKey(),
  question: text().notNull(),
  answer: text().notNull(),
  position: integer().notNull().default(0),
});

export const subscribers = pgTable(
  "subscribers",
  {
    id: serial().primaryKey(),
    email: text().notNull(),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [uniqueIndex("subscribers_email").on(sql`lower(${t.email})`)],
);

/** Wrong admin codes per address, so guessing is throttled across servers. */
export const loginAttempts = pgTable("login_attempts", {
  ip: text().primaryKey(),
  count: integer().notNull().default(0),
  until: text().notNull(), // ms since epoch, as text
});
