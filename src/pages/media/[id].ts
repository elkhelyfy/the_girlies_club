import type { APIRoute } from "astro";
import { getMedia } from "../../lib/images";

/** Serves photos uploaded through /admin. IDs are never reused, so cache hard. */
export const GET: APIRoute = ({ params }) => {
  const id = Number(params.id);
  const media = Number.isInteger(id) ? getMedia(id) : undefined;
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
