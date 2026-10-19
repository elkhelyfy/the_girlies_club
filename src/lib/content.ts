import { db } from "./db";

/* ==========================================================================
   Shared vocabulary
   ========================================================================== */

export const CRAFTS = ["Crochet", "Peinture", "Broderie", "Other"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"] as const;

/** Colour families used across cards. Each has an ink and a soft surface. */
export const TONES = {
  blush: { label: "Blush", accent: "#c2185b", soft: "#fbe6ec", surface: "linear-gradient(150deg, #fccee8 0%, #ff8c8c 100%)" },
  peri: { label: "Periwinkle", accent: "#2b4cf5", soft: "#dbeafe", surface: "linear-gradient(150deg, #bedbff 0%, #abbffb 100%)" },
  amber: { label: "Amber", accent: "#b45309", soft: "#fef3c6", surface: "linear-gradient(150deg, #ffefa7 0%, #ffb753 100%)" },
  mint: { label: "Mint", accent: "#1d7a4c", soft: "#dcfce7", surface: "linear-gradient(150deg, #a4f4cf 0%, #5ee9b5 100%)" },
  cream: { label: "Cream", accent: "#9a3412", soft: "#ffedd4", surface: "linear-gradient(150deg, #ffedd4 0%, #fef3c6 100%)" },
  lime: { label: "Lime", accent: "#4d7c0f", soft: "#f0fb7f", surface: "linear-gradient(150deg, #f0fb7f 0%, #e4fb53 100%)" },
} as const;
export type Tone = keyof typeof TONES;
export const tone = (key: string) => TONES[key as Tone] ?? TONES.blush;

export const CRAFT_TONE: Record<string, Tone> = {
  Crochet: "blush",
  Peinture: "peri",
  Broderie: "mint",
  Other: "amber",
};

/** Workshops run on Casablanca time regardless of where the server is. */
export const TIME_ZONE = "Africa/Casablanca";

export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/* ==========================================================================
   Settings — editable site text, with defaults so nothing is ever blank
   ========================================================================== */

export const SETTING_FIELDS = [
  { key: "instagram_handle", label: "Instagram username", hint: "Without the @. Drives every Instagram and DM link.", default: "the_girlies__club" },
  { key: "followers", label: "Instagram followers", hint: "Shown in the hero and stats, e.g. 4.8K.", default: "4.8K" },
  { key: "ticker_text", label: "Announcement bar", hint: "The burgundy strip above the header.", default: "New: broderie joins the table" },
  { key: "ticker_cta", label: "Announcement link label", default: "Save a seat" },
  { key: "hero_lede", label: "Hero intro", multiline: true, default: "Weekend workshops for women in Casablanca. Every material on the table, a pause café halfway through, zero experience needed." },
  { key: "motto", label: "Motto (French)", default: "Un espace pour créer & se détendre" },
  { key: "membership_price", label: "Girlies Pass price (DH / month)", default: "500" },
  { key: "membership_note", label: "Girlies Pass status line", default: "Opening soon — DM us to get on the list" },
  { key: "private_note", label: "Private events small print", default: "Send the date, the headcount and the craft — we reply with a quote." },
  { key: "reschedule_policy", label: "Reschedule policy", default: "Free reschedule up to 48 hours before." },
  {
    key: "booking_note",
    label: "Reservation page note",
    hint: "Shown beside the reservation form — payment details, what to bring, etc.",
    multiline: true,
    default: "We'll confirm your seat by WhatsApp or Instagram — keep an eye on your messages 🌸",
  },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"];
export type Settings = Record<SettingKey, string> & {
  instagramUrl: string;
  dmUrl: string;
  handle: string;
};

export function getSettings(): Settings {
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const values = Object.fromEntries(
    SETTING_FIELDS.map((f) => [f.key, stored[f.key]?.trim() ? stored[f.key] : f.default]),
  ) as Record<SettingKey, string>;
  const ig = cleanHandle(values.instagram_handle) || "the_girlies__club";
  return {
    ...values,
    handle: `@${ig}`,
    instagramUrl: `https://www.instagram.com/${ig}/`,
    dmUrl: `https://ig.me/m/${ig}`,
  };
}

export function saveSettings(values: Partial<Record<SettingKey, string>>) {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  for (const field of SETTING_FIELDS) {
    const value = values[field.key];
    if (value !== undefined) upsert.run(field.key, value.trim());
  }
}

/* ==========================================================================
   The wall
   ========================================================================== */

export type WallPost = {
  id: number;
  image: string;
  alt: string;
  instagram: string;
  title: string;
  craft: string;
  featured: number;
  tall: number;
  published: number;
  created_at: string;
};

export function wallPosts(opts: { limit?: number; includeHidden?: boolean } = {}): WallPost[] {
  const where = opts.includeHidden ? "" : "WHERE published = 1";
  return db
    .prepare(`SELECT * FROM wall_posts ${where} ORDER BY featured DESC, created_at DESC, id DESC LIMIT ?`)
    .all(opts.limit ?? 1000) as WallPost[];
}

export function getWallPost(id: number): WallPost | undefined {
  return db.prepare("SELECT * FROM wall_posts WHERE id = ?").get(id) as WallPost | undefined;
}

export type WallInput = Omit<WallPost, "id" | "created_at">;

export function saveWallPost(id: number | null, p: WallInput): number {
  const values = [p.image, p.alt, p.instagram, p.title, p.craft, p.featured, p.tall, p.published];
  if (id) {
    db.prepare("UPDATE wall_posts SET image=?, alt=?, instagram=?, title=?, craft=?, featured=?, tall=?, published=? WHERE id=?")
      .run(...values, id);
    return id;
  }
  const result = db
    .prepare("INSERT INTO wall_posts (image, alt, instagram, title, craft, featured, tall, published) VALUES (?,?,?,?,?,?,?,?)")
    .run(...values);
  return Number(result.lastInsertRowid);
}

export const deleteWallPost = (id: number) => db.prepare("DELETE FROM wall_posts WHERE id = ?").run(id);

/* ==========================================================================
   Testimonials
   ========================================================================== */

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string | null;
  tone: string;
  position: number;
  published: number;
};

export function testimonials(includeHidden = false): Testimonial[] {
  const where = includeHidden ? "" : "WHERE published = 1";
  return db.prepare(`SELECT * FROM testimonials ${where} ORDER BY position, id`).all() as Testimonial[];
}

export function getTestimonial(id: number): Testimonial | undefined {
  return db.prepare("SELECT * FROM testimonials WHERE id = ?").get(id) as Testimonial | undefined;
}

export function saveTestimonial(id: number | null, t: Omit<Testimonial, "id">): number {
  const values = [t.quote, t.name, t.role, t.avatar, t.tone, t.position, t.published];
  if (id) {
    db.prepare("UPDATE testimonials SET quote=?, name=?, role=?, avatar=?, tone=?, position=?, published=? WHERE id=?")
      .run(...values, id);
    return id;
  }
  const result = db
    .prepare("INSERT INTO testimonials (quote, name, role, avatar, tone, position, published) VALUES (?,?,?,?,?,?,?)")
    .run(...values);
  return Number(result.lastInsertRowid);
}

export const deleteTestimonial = (id: number) => db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);

/* ==========================================================================
   FAQ
   ========================================================================== */

export type Faq = { id: number; question: string; answer: string; position: number };

export const faqs = () => db.prepare("SELECT * FROM faqs ORDER BY position, id").all() as Faq[];

export function getFaq(id: number): Faq | undefined {
  return db.prepare("SELECT * FROM faqs WHERE id = ?").get(id) as Faq | undefined;
}

export function saveFaq(id: number | null, f: Omit<Faq, "id">): number {
  if (id) {
    db.prepare("UPDATE faqs SET question=?, answer=?, position=? WHERE id=?").run(f.question, f.answer, f.position, id);
    return id;
  }
  const result = db.prepare("INSERT INTO faqs (question, answer, position) VALUES (?,?,?)").run(f.question, f.answer, f.position);
  return Number(result.lastInsertRowid);
}

export const deleteFaq = (id: number) => db.prepare("DELETE FROM faqs WHERE id = ?").run(id);

/* ==========================================================================
   Newsletter
   ========================================================================== */

export type Subscriber = { id: number; email: string; created_at: string };

export function addSubscriber(email: string): "added" | "exists" {
  const result = db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
  return result.changes ? "added" : "exists";
}

export const subscribers = () =>
  db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC, id DESC").all() as Subscriber[];

export const deleteSubscriber = (id: number) => db.prepare("DELETE FROM subscribers WHERE id = ?").run(id);

/* ==========================================================================
   Helpers
   ========================================================================== */

/** "@Sarah.K " → "sarah.k". Instagram usernames: letters, digits, . and _. */
export function cleanHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 30);
}

export const instagramUrl = (handle: string) => `https://www.instagram.com/${cleanHandle(handle)}/`;

export function counts() {
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    events: one("SELECT COUNT(*) AS n FROM events"),
    locations: one("SELECT COUNT(*) AS n FROM locations WHERE active = 1"),
    wall: one("SELECT COUNT(*) AS n FROM wall_posts"),
    testimonials: one("SELECT COUNT(*) AS n FROM testimonials"),
    faqs: one("SELECT COUNT(*) AS n FROM faqs"),
    subscribers: one("SELECT COUNT(*) AS n FROM subscribers"),
  };
}
