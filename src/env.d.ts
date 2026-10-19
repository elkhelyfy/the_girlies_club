/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Editable site text, loaded once per request by the middleware. */
    settings: import("./lib/content").Settings;
  }
}
