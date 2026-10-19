/** Date helpers. Dates are stored as plain YYYY-MM-DD in Casablanca time. */

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};

/** Noon UTC keeps the calendar day stable whatever the server's zone is. */
export const toDate = (iso: string) => {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts });

/** "Sat 24 Oct" */
export const formatDay = (iso: string) => fmt({ weekday: "short", day: "numeric", month: "short" }).format(toDate(iso));
/** "Sat" */
export const weekday = (iso: string) => fmt({ weekday: "short" }).format(toDate(iso));
/** "24 Oct" */
export const dayMonth = (iso: string) => fmt({ day: "numeric", month: "short" }).format(toDate(iso));
/** "Saturday 24 October" */
export const longDay = (iso: string) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(toDate(iso));
/** "November 2026" */
export const monthTitle = (y: number, m: number) =>
  fmt({ month: "long", year: "numeric" }).format(new Date(Date.UTC(y, m - 1, 1, 12)));

export const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Monday-first weekday index, 0–6. */
export const mondayIndex = (y: number, m: number, d: number) => (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;

export function shiftMonth(y: number, m: number, by: number) {
  const index = y * 12 + (m - 1) + by;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}
