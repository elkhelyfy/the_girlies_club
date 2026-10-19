# The Girlies Club

Website for **The Girlies Club** — crochet, peinture and broderie workshops for
women in Casablanca ([@the_girlies__club](https://www.instagram.com/the_girlies__club/)).

Built with [Astro](https://astro.build), rendered on the server by
`@astrojs/node`, with everything editable stored in a single **SQLite** file.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: hero, next sessions, wall preview, private events, pass, testimonials, FAQ |
| `/calendar` | Month calendar of upcoming workshops (`?month=2026-11`) + the full "coming up" list |
| `/calendar/<id>.ics` | "Add to my calendar" file for one workshop |
| `/wall` | Every piece made in a workshop, tagged with the maker's Instagram, filterable by craft |
| `/admin` | Management area, locked by a security code |

## Getting started

```sh
npm install
cp .env.example .env     # then set ADMIN_CODE to something long
npm run dev              # http://localhost:4321
```

Requires **Node 22.13+** (uses the built-in `node:sqlite`, so there's nothing
native to compile).

On first run the database is created at `data/girlies.db` and filled with the
current events, wall pieces, testimonials and FAQ. It's never overwritten after
that. To start over, stop the server and delete the `data/` folder.

## Admin

Go to `/admin` and enter the `ADMIN_CODE` from `.env`.

| Section | Manages |
| --- | --- |
| Events | Workshops on the calendar: date, time, price, seats left, photo, colour |
| The Wall | Photos of finished pieces + the maker's Instagram username |
| Testimonials | Quotes on the home page |
| FAQ | Questions on the home page |
| Site text | Instagram handle, follower count, announcement bar, hero intro, pass price… |
| Mailing list | Sign-ups from the footer, downloadable as CSV |

Photos are uploaded straight into the database (JPEG, PNG or WebP, up to 6 MB),
or picked from the photos bundled with the site.

Security notes:

- The code is compared in constant time; a correct code sets a signed,
  httpOnly, SameSite=Strict cookie that lasts 12 hours.
- Five wrong codes from one address locks it out for 15 minutes.
- Changing `ADMIN_CODE` logs everyone out.
- Cross-site form posts are rejected (Astro's origin check).

## Production

```sh
npm run build
npm start                # reads .env, serves on port 4321 (set PORT/HOST to change)
```

Back up `data/girlies.db` — it holds every event, upload and sign-up. Set
`DATABASE_PATH` in `.env` to keep it somewhere else (e.g. a mounted volume).

## Code map

- `src/lib/db.ts` — connection + migrations; `src/lib/seed.ts` — first-run content
- `src/lib/content.ts` — every query the pages and admin use, plus site-text defaults
- `src/lib/auth.ts`, `src/middleware.ts` — admin login and route guard
- `src/lib/images.ts`, `src/pages/media/[id].ts` — uploads and serving them
- `src/data/site.ts` — static design copy that isn't managed from the admin
