CREATE TABLE "events" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"craft" text NOT NULL,
	"level" text DEFAULT 'Beginner' NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"capacity" integer DEFAULT 12 NOT NULL,
	"held_seats" integer DEFAULT 0 NOT NULL,
	"price" integer DEFAULT 250 NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"image" text,
	"alt" text DEFAULT '' NOT NULL,
	"tone" text DEFAULT 'blush' NOT NULL,
	"is_new" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"location_id" integer,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"maps_url" text DEFAULT '' NOT NULL,
	"capacity" integer,
	"notes" text DEFAULT '' NOT NULL,
	"public_address" integer DEFAULT 0 NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"ip" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"until" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY,
	"mime" text NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"event_id" integer NOT NULL,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"seats" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment" text DEFAULT 'unpaid' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"admin_notes" text DEFAULT '' NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL,
	"updated_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY,
	"quote" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"avatar" text,
	"tone" text DEFAULT 'blush' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wall_posts" (
	"id" serial PRIMARY KEY,
	"image" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"instagram" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"craft" text DEFAULT 'Crochet' NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"tall" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"created_at" text DEFAULT to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS') NOT NULL
);
--> statement-breakpoint
CREATE INDEX "events_date" ON "events" ("date","start_time");--> statement-breakpoint
CREATE INDEX "reservations_event" ON "reservations" ("event_id","status");--> statement-breakpoint
CREATE INDEX "reservations_status" ON "reservations" ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_email" ON "subscribers" (lower("email"));--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;