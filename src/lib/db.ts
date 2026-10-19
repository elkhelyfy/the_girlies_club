import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DATABASE_PATH } from "astro:env/server";
import { seed } from "./seed";

/**
 * One SQLite file holds everything the admin can edit — events, the wall,
 * testimonials, FAQ, site text, uploaded photos and newsletter sign-ups.
 *
 * Uses Node's built-in `node:sqlite` (Node 22.13+), so there is no native
 * module to compile on install.
 */

const MIGRATIONS: string[] = [
  /* 1 — initial schema */ `
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE media (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    mime       TEXT NOT NULL,
    bytes      BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    craft      TEXT NOT NULL,
    level      TEXT NOT NULL DEFAULT 'Beginner',
    date       TEXT NOT NULL,              -- YYYY-MM-DD, Casablanca time
    start_time TEXT NOT NULL,              -- HH:MM
    end_time   TEXT NOT NULL,              -- HH:MM
    capacity   INTEGER NOT NULL DEFAULT 12,
    seats_left INTEGER NOT NULL DEFAULT 12,
    price      INTEGER NOT NULL DEFAULT 250,
    blurb      TEXT NOT NULL DEFAULT '',
    image      TEXT,                       -- asset:<key> | media:<id> | NULL
    alt        TEXT NOT NULL DEFAULT '',
    tone       TEXT NOT NULL DEFAULT 'blush',
    location   TEXT NOT NULL DEFAULT '',
    is_new     INTEGER NOT NULL DEFAULT 0,
    published  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX events_date ON events(date, start_time);

  CREATE TABLE wall_posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    image      TEXT NOT NULL,
    alt        TEXT NOT NULL DEFAULT '',
    instagram  TEXT NOT NULL,              -- username, no @
    title      TEXT NOT NULL DEFAULT '',   -- e.g. "Beanie Night, Dec"
    craft      TEXT NOT NULL DEFAULT 'Crochet',
    featured   INTEGER NOT NULL DEFAULT 0,
    tall       INTEGER NOT NULL DEFAULT 0,
    published  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE testimonials (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    quote     TEXT NOT NULL,
    name      TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT '',
    avatar    TEXT,
    tone      TEXT NOT NULL DEFAULT 'blush',
    position  INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE faqs (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer   TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE subscribers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,

  /* 2 — bookings: event status, locations, reservations ------------------- */ `
  CREATE TABLE locations (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL,
    area           TEXT NOT NULL DEFAULT '',   -- neighbourhood, shown publicly
    address        TEXT NOT NULL DEFAULT '',   -- sent on confirmation
    maps_url       TEXT NOT NULL DEFAULT '',
    capacity       INTEGER,                    -- a hint for new events
    notes          TEXT NOT NULL DEFAULT '',   -- private: door code, parking…
    public_address INTEGER NOT NULL DEFAULT 0, -- show the street address on the site
    active         INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Free-text locations typed on events so far become real locations.
  INSERT INTO locations (name)
    SELECT DISTINCT trim(location) FROM events WHERE trim(location) <> '';

  ALTER TABLE events ADD COLUMN location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
  UPDATE events SET location_id = (SELECT id FROM locations WHERE name = trim(events.location))
    WHERE trim(location) <> '';

  -- draft | open | closed | cancelled | done
  ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
  UPDATE events SET status = CASE WHEN published = 1 THEN 'open' ELSE 'draft' END;

  -- Seats left are now counted from reservations. Seats already taken before
  -- this (e.g. booked by DM) are kept as "held" so the numbers don't jump.
  ALTER TABLE events ADD COLUMN held_seats INTEGER NOT NULL DEFAULT 0;
  UPDATE events SET held_seats = max(0, capacity - seats_left);

  ALTER TABLE events ADD COLUMN notes TEXT NOT NULL DEFAULT '';  -- private, admin only

  ALTER TABLE events DROP COLUMN seats_left;
  ALTER TABLE events DROP COLUMN published;
  ALTER TABLE events DROP COLUMN location;

  CREATE TABLE reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT NOT NULL UNIQUE,          -- short reference, e.g. GC-7K2P
    event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL DEFAULT '',
    instagram   TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL DEFAULT '',
    seats       INTEGER NOT NULL DEFAULT 1,
    -- pending | confirmed | waitlist | attended | no_show | cancelled
    status      TEXT NOT NULL DEFAULT 'pending',
    payment     TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | deposit | paid
    source      TEXT NOT NULL DEFAULT 'website',
    message     TEXT NOT NULL DEFAULT '',      -- from the guest
    admin_notes TEXT NOT NULL DEFAULT '',      -- private
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX reservations_event ON reservations(event_id, status);
  CREATE INDEX reservations_status ON reservations(status, created_at);

  -- The seeded FAQ said "DM us"; booking now happens on the site.
  UPDATE faqs SET answer = 'Pick a date on the calendar and tap Reserve — it takes a minute. We confirm your seat by WhatsApp or Instagram and send you the address. You can still DM us if you prefer.'
    WHERE question = 'How do I book a seat?'
      AND answer = 'Send a DM to @the_girlies__club on Instagram with the session name. We confirm your seat and send you the address and the details.';
  `,
];

function open(): DatabaseSync {
  const file = resolve(DATABASE_PATH || "data/girlies.db");
  mkdirSync(dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");

  const { user_version: version } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  if (version < MIGRATIONS.length) {
    db.exec("BEGIN");
    try {
      for (let v = version; v < MIGRATIONS.length; v++) db.exec(MIGRATIONS[v]);
      if (version === 0) seed(db);
      db.exec(`PRAGMA user_version = ${MIGRATIONS.length}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return db;
}

// One connection per server process; survives dev-server module reloads.
const g = globalThis as typeof globalThis & { __girliesDb?: DatabaseSync };
export const db: DatabaseSync = (g.__girliesDb ??= open());
