import type { APIRoute } from "astro";
import { subscribers } from "../../lib/content";

/** Protected by the /admin middleware like every other admin route. */
export const GET: APIRoute = () => {
  // Quote every cell, and defuse leading = + - @ so spreadsheets don't run it.
  const cell = (value: string) => `"${value.replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
  const rows = [["email", "joined_utc"], ...subscribers().map((s) => [s.email, s.created_at])];
  const csv = rows.map((row) => row.map(cell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="girlies-mailing-list.csv"',
    },
  });
};
