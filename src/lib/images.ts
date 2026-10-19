import type { ImageMetadata } from "astro";
import { db } from "./db";
import { library } from "./assets";

/**
 * An image reference stored in the database:
 *   asset:<key>  — a photo bundled with the site (lib/assets.ts)
 *   media:<id>   — a photo uploaded through /admin, stored as a BLOB
 */
export type ResolvedImage =
  | { kind: "asset"; image: ImageMetadata }
  | { kind: "media"; src: string };

export function resolveImage(ref: string | null | undefined): ResolvedImage | null {
  if (!ref) return null;
  const [kind, value] = ref.split(":", 2);
  if (kind === "asset" && library[value]) return { kind: "asset", image: library[value].image };
  if (kind === "media" && /^\d+$/.test(value)) return { kind: "media", src: `/media/${value}` };
  return null;
}

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/** Sniff the real type from the first bytes — never trust the browser's claim. */
function sniff(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

export class UploadError extends Error {}

/** Stores an uploaded file and returns its `media:<id>` reference. */
export async function storeUpload(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("That photo is over 6 MB — please export a smaller one.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniff(bytes);
  if (!mime) throw new UploadError("Only JPEG, PNG or WebP photos can be uploaded.");
  const result = db.prepare("INSERT INTO media (mime, bytes) VALUES (?, ?)").run(mime, bytes);
  return `media:${result.lastInsertRowid}`;
}

export function getMedia(id: number): { mime: string; bytes: Uint8Array } | undefined {
  return db.prepare("SELECT mime, bytes FROM media WHERE id = ?").get(id) as
    | { mime: string; bytes: Uint8Array }
    | undefined;
}

/**
 * Works out the image a form submitted: a new upload wins, then a library
 * pick, then whatever was there before. `clear` removes the image.
 */
export async function imageFromForm(form: FormData, field: string, current: string | null): Promise<string | null> {
  const file = form.get(`${field}_file`);
  if (file instanceof File && file.size > 0) return storeUpload(file);
  if (form.get(`${field}_clear`) === "on") return null;
  const picked = String(form.get(`${field}_library`) ?? "");
  if (picked && picked !== "keep" && library[picked]) return `asset:${picked}`;
  return current;
}
