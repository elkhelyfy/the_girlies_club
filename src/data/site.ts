/**
 * Static design content — the copy that shapes the page and rarely changes.
 *
 * Anything the team edits day to day (events, the wall, testimonials, FAQ,
 * Instagram handle, follower count, prices, announcement bar…) lives in the
 * SQLite database and is managed from /admin. See src/lib/content.ts.
 */
import meshBag from "../assets/crochet.jpeg";
import glassParty from "../assets/kissan.jpeg";
import paintedGlass from "../assets/kas_kabir.jpeg";
import paintedMirror from "../assets/mirror_flower.jpeg";
import paintedTote from "../assets/totbag.jpeg";

export const site = {
  name: "the girlies club",
  tagline: "Craft workshops & pause café for girls who make things.",
  city: "Casablanca",
  year: 2026,
  currency: "DH",
} as const;

/** "250 DH" — Moroccan convention puts the unit after the amount. */
export const price = (amount: number) => `${amount} ${site.currency}`;

/** The three crafts listed in the Instagram bio. */
export const crafts = [
  { emoji: "🧶", label: "Crochet" },
  { emoji: "🎨", label: "Peinture" },
  { emoji: "🪡", label: "Broderie" },
] as const;

export const nav = [
  { label: "Sessions", href: "/#sessions" },
  { label: "Calendar", href: "/calendar" },
  { label: "The Wall", href: "/wall", dot: true },
  { label: "Private events", href: "/#private" },
  { label: "FAQ", href: "/#faq" },
];

export const perks = [
  { label: "Everything supplied — just bring yourself" },
  { label: "Pause café on the table" },
  { label: "100% femmes" },
] as const;

/** The crafts we run, in general — dated sessions live in the database. */
export const pillars = [
  {
    title: ["Glass", "painting"],
    body: "Daisies, bees, a whole meadow around a wine glass. You draw it on in enamel, we bake it so it survives the dishwasher, and you drink from it that same week.",
    note: "2 hours · glass and paints included",
    image: paintedGlass,
    alt: "Hand holding a wine glass hand-painted with pink and white daisies and a gold bee",
    surface: "linear-gradient(150deg, #ffe8f5 0%, #ffa7a7 100%)",
  },
  {
    title: ["Mirror", "painting"],
    body: "A round mirror on a little easel and a palette of acrylics. Copy our tulip border or invent your own — it goes home dry, framed and ready to hang by the door.",
    note: "2 hours · mirror and easel included",
    image: paintedMirror,
    alt: "Round mirror on a wooden easel painted with a border of pink tulips, palette in front",
    surface: "linear-gradient(150deg, #e6ecff 0%, #aebef4 100%)",
  },
  {
    title: ["Tote bag", "painting"],
    body: "Fabric paint on raw canvas: grapefruit, hibiscus, pomegranate, whatever's in season. We heat-set it before you leave so it lives through the washing machine.",
    note: "2 hours · tote and fabric paints included",
    image: paintedTote,
    alt: "Canvas tote bag hand-painted with grapefruit, hibiscus and pomegranate motifs",
    surface: "linear-gradient(150deg, #ffedd4 0%, #fff186 100%)",
  },
  {
    title: ["Crochet", "a market bag"],
    body: "From the very first loop to a full-size string bag in one sitting. The mesh stitch is four rows of practice and then muscle memory — no experience needed, nothing left half-done.",
    note: "2 hours · yarn and hooks included",
    image: meshBag,
    alt: "Lime open-mesh crocheted market bag laid out on a grey knit jumper",
    surface: "linear-gradient(150deg, #dcfce7 0%, #a4f4cf 100%)",
  },
];

export const steps = [
  {
    title: "Pick a date",
    body: "Choose the session that suits your mood and reserve online. We confirm by WhatsApp or Instagram and send the address.",
    icon: "box",
    surface: "linear-gradient(150deg, #dcfce7 0%, #d0fae5 100%)",
  },
  {
    title: "Just turn up",
    body: "Materials, tools and the pause café are on the table. Bring your hands and nothing else.",
    icon: "spark",
    surface: "linear-gradient(150deg, #dbeafe 0%, #e0e7ff 100%)",
  },
  {
    title: "Take it home",
    body: "Two hours later you're holding a finished thing — and you've got new people to make things with.",
    icon: "heart",
    surface: "linear-gradient(150deg, #fce7f3 0%, #ffe4e6 100%)",
  },
];

/** Price and status line come from the database (Site text in /admin). */
export const membership = {
  eyebrow: "Season pass",
  name: "The Girlies Pass",
  badge: "Coming soon",
  chip: "2 sessions / month",
  overlay: "Every craft, every month",
  quote: "Every stitch feels good, every project feels like a win.",
  quoteBy: "Imane, a regular since March",
  benefits: [
    { icon: "box", text: "Two full workshops every month", tone: "#dcfce7" },
    { icon: "trend", text: "Crochet, peinture, broderie — switch crafts whenever", tone: "#fce7f3" },
    { icon: "spark", text: "First pick of seats before public booking", tone: "#dbeafe" },
    { icon: "bolt", text: "Members-only evenings and studio open hours", tone: "#dcfce7" },
    { icon: "heart", text: "Bring a friend once a month, on us", tone: "#fce7f3" },
  ],
};

export const closing = {
  title: ["A table, a craft,", "and the girlies."],
  body: "Every session is two hours off your phone, in a room that smells like coffee, next to people who get it. Come alone — you won't leave alone.",
  chips: [
    { label: "A new craft every month" },
    { label: "All materials provided" },
    { label: "Pause café always included" },
    { label: "Come solo or bring the group" },
  ],
  cta: "See the calendar",
};

/** "On se déplace" — the club brings the table to your event. */
export const privateEvents = {
  image: glassParty,
  alt: "A table of friends clinking wine glasses they hand-painted with daisies, hearts and lavender",
  occasions: ["Birthdays", "EVJF & bridal showers", "Baby showers", "Team days", "Girls' night in"],
  points: [
    {
      title: "We bring the whole table",
      body: "Materials, tools, aprons, the set-up and the pause café. You provide the room and the girls.",
    },
    {
      title: "Pick any craft",
      body: "Glass, mirror or tote painting, crochet or broderie — or mix two for a longer session.",
    },
    {
      title: "Everyone leaves with something",
      body: "A finished piece per guest, and the photos to prove it. No half-done projects in a bag.",
    },
  ],
};

export const footerLinks = [
  {
    heading: "Sessions",
    links: [
      { label: "Calendar", href: "/calendar" },
      { label: "Next dates", href: "/#sessions" },
      { label: "The crafts", href: "/#workshops" },
      { label: "The Wall", href: "/wall" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Private events", href: "/#private" },
      { label: "Birthdays & EVJF", href: "/#private" },
      { label: "FAQs", href: "/#faq" },
    ],
  },
];
