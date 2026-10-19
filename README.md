# The Girlies Club

Website for **The Girlies Club** — crochet, peinture and broderie workshops for
women in Casablanca ([@the_girlies__club](https://www.instagram.com/the_girlies__club/)).

Built with [Astro](https://astro.build) and hosted on **Netlify**: pages render
on request in a Netlify Function, everything editable lives in **Netlify
Database** (managed Postgres), and uploaded photos live in **Netlify Blobs**.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: hero, next sessions, wall preview, private events, pass, testimonials, FAQ |
| `/calendar` | Month calendar of upcoming workshops (`?month=2026-11`) + the full "coming up" list |
| `/calendar/<id>.ics` | "Add to my calendar" file for one workshop |
| `/reserve/<id>` | Reservation form for one workshop (joins the wait list when it's full) |
| `/wall` | Every piece made in a workshop, tagged with the maker's Instagram |
| `/admin` | Management area, locked by a security code |

## Getting started

The database runs locally through the Netlify CLI, so develop with `netlify dev`
rather than `npm run dev`.

```sh
npm install
npm install -g netlify-cli
netlify link                          # connect this folder to the Netlify site
cp .env.example .env                  # then set ADMIN_CODE to something long
netlify dev                           # starts the site and a local Postgres
netlify database migrations apply     # first time: create the tables + starter content
```

`netlify database status` shows the local database; `netlify database reset`
wipes it (local only — never production).

## Deploying

Push to `main`. Netlify builds with `npm run build`, applies any new migrations
from `netlify/database/migrations/` to the production database, and publishes.

Set these in **Netlify → Site configuration → Environment variables**:

| Variable | What it's for |
| --- | --- |
| `ADMIN_CODE` | Unlocks `/admin` (at least 6 characters). Changing it logs everyone out. |

The database connection is provided by Netlify automatically.

### Database costs

Netlify Database runs on credit-based plans and bills database compute while
it's awake (it sleeps after 5 minutes idle). On the **Free** plan the total is
capped at **48 compute hours per month** — every visit that wakes the database
uses at least 5 minutes — so a site with steady traffic will want the Personal
plan. See Netlify's
[billing and limits](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/).
Backups: Netlify keeps scheduled backups (3 days on Free, 7 on Personal); see
[backup and recovery](https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery/).

## Changing the database

The schema is defined in `db/schema.ts` (Drizzle). After editing it:

```sh
npx drizzle-kit generate --name describe-the-change   # writes a new migration
netlify database migrations apply                      # try it locally
```

Commit the new folder in `netlify/database/migrations/`; it's applied on the
next deploy. Never edit a migration that has already been deployed.

## Admin

Go to `/admin` and enter the `ADMIN_CODE`.

| Section | Manages |
| --- | --- |
| Overview | New requests to confirm, seats booked in the next 30 days, upcoming events |
| Events | Workshops with statuses (draft, open, closed, cancelled, done), seats, price, location |
| Event page | Its guests: confirm, wait list, check-in, payment, WhatsApp message, move, CSV |
| Reservations | Every booking, filterable and searchable |
| Girlies | Everyone who has booked, grouped by phone / Instagram / email |
| Locations | Studios and cafés: area (public), address and map link (sent to guests) |
| The Wall | Photos of finished pieces + the maker's Instagram username |
| Testimonials, FAQ | Content on the home page |
| Site text | Instagram handle, follower count, announcement bar, hero intro, pass price… |
| Mailing list | Sign-ups from the footer, downloadable as CSV |

Photos can be uploaded (JPEG, PNG or WebP, up to 6 MB) or picked from the photos
bundled with the site.

Security notes:

- The code is compared in constant time; a correct code sets a signed,
  httpOnly, SameSite=Strict cookie that lasts 12 hours.
- Five wrong codes from one address locks it out for 15 minutes (tracked in
  the database, so it holds across function instances).
- Cross-site form posts are rejected (Astro's origin check).
- Reservations lock the event row, so two people can't take the last seat.

## Code map

- `db/schema.ts` — tables; `netlify/database/migrations/` — schema + starter content
- `src/lib/db.ts` — query helpers (`all`, `get`, `exec`, `transaction`)
- `src/lib/content.ts` — site text, wall, testimonials, FAQ, mailing list
- `src/lib/bookings.ts` — events, statuses, locations, reservations, people
- `src/lib/auth.ts`, `src/middleware.ts` — admin login and route guard
- `src/lib/images.ts`, `src/pages/media/[id].ts` — uploads (Netlify Blobs) and serving them
- `src/data/site.ts` — static design copy that isn't managed from the admin
