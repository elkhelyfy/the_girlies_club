import type { ImageMetadata } from "astro";
import crochet from "../assets/workshops/crochet.jpg";
import blanket from "../assets/workshops/blanket.png";
import beanie from "../assets/workshops/beanie.png";
import tote from "../assets/workshops/tote.png";

import mustardThrow from "../assets/community/mustard-throw.png";
import starBlanket from "../assets/community/star-blanket.jpg";
import sunflowerBags from "../assets/community/sunflower-bags.jpg";
import shaggyRug from "../assets/community/shaggy-rug.jpg";
import patchwork from "../assets/community/patchwork.png";
import rainbowBeanie from "../assets/community/rainbow-beanie.png";
import yarnBowl from "../assets/community/yarn-bowl.png";
import pinkTote from "../assets/community/pink-tote.png";

import meshBag from "../assets/crochet.jpeg";
import glassParty from "../assets/kissan.jpeg";
import meshInProgress from "../assets/crochet1.jpeg";
import paintedGlass from "../assets/kas_kabir.jpeg";
import paintedMirror from "../assets/mirror_flower.jpeg";
import paintedTote from "../assets/totbag.jpeg";

import maya from "../assets/people/maya.png";
import lisa from "../assets/people/lisa.png";
import monica from "../assets/people/monica.png";
import samantha from "../assets/people/samantha.png";
import casey from "../assets/people/casey.png";
import riley from "../assets/people/riley.png";

export const site = {
  name: "the girlies club",
  handle: "@the_girlies__club",
  tagline: "Craft workshops & pause café for girls who make things.",
  /** The line from the Instagram bio, kept in French. */
  motto: "Un espace pour créer & se détendre",
  city: "Casablanca",
  year: 2026,
  instagram: "https://www.instagram.com/the_girlies__club/",
  /** Opens a DM thread — this is how seats are booked today. */
  dm: "https://ig.me/m/the_girlies__club",
  followers: "4.8K",
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
  { label: "Sessions", href: "#sessions" },
  { label: "Private events", href: "#private" },
  { label: "The Wall", href: "#community", dot: true },
  { label: "Pass", href: "#membership" },
  { label: "FAQ", href: "#faq" },
];

export const stats = [
  { value: "4.8K", label: "Girlies following on Instagram" },
  { value: "100%", label: "Women only, every session" },
  { value: "2h", label: "Per workshop, pause café included" },
  { value: "Zero", label: "Experience needed" },
];

export const perks = [
  { label: "Everything supplied — just bring yourself" },
  { label: "Pause café on the table" },
  { label: "100% femmes" },
] as const;

/** The four crafts we run, in general — dates for each live in `sessions`. */
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

/**
 * Upcoming sessions. These are events you book a seat at — not products.
 * A session without a photo shows the tulip illustration instead.
 */
export type Session = {
  name: string;
  craft: string;
  level: string;
  day: string;
  date: string;
  time: string;
  seats: number;
  capacity: number;
  seat: number;
  blurb: string;
  image?: ImageMetadata;
  alt?: string;
  accent: string;
  tone: "blush" | "peri" | "amber" | "mint";
  isNew?: boolean;
};

export const sessions: Session[] = [
  {
    name: "Mirror Painting Date",
    craft: "Peinture",
    level: "Beginner",
    day: "Sat",
    date: "24 Oct",
    time: "15:00 – 17:00",
    seats: 3,
    capacity: 12,
    seat: 300,
    blurb:
      "Bring your bestie, pick a palette, paint a tulip border around your own mirror. It goes home dry and ready to hang.",
    image: paintedMirror,
    alt: "Round mirror on a wooden easel painted with a border of pink tulips, palette in front",
    accent: "#2b4cf5",
    tone: "peri",
  },
  {
    name: "Just Crochet",
    craft: "Crochet",
    level: "Beginner",
    day: "Sun",
    date: "1 Nov",
    time: "14:00 – 16:00",
    seats: 7,
    capacity: 12,
    seat: 250,
    blurb:
      "Learn the loops that make a flower, then string a whole garland of them. You walk out wearing one.",
    image: crochet,
    alt: "Crocheted cream and mustard daisies laid out on a round wooden table",
    accent: "#c2185b",
    tone: "blush",
  },
  {
    name: "Broderie & Pause Café",
    craft: "Broderie",
    level: "Beginner",
    day: "Sat",
    date: "7 Nov",
    time: "11:00 – 13:00",
    seats: 9,
    capacity: 12,
    seat: 250,
    blurb:
      "A hoop, a needle, six colours of thread. Stitch a little bouquet you can frame or sew straight onto a jacket.",
    accent: "#1d7a4c",
    tone: "mint",
    isNew: true,
  },
  {
    name: "Flower Market Bag",
    craft: "Crochet",
    level: "Intermediate",
    day: "Sun",
    date: "15 Nov",
    time: "13:00 – 15:30",
    seats: 2,
    capacity: 10,
    seat: 350,
    blurb:
      "Sunflower motifs, joined panels, finished straps. The busiest afternoon on the calendar — worth it.",
    image: sunflowerBags,
    alt: "Sunflower-motif crocheted market bags hanging on a rail",
    accent: "#b45309",
    tone: "amber",
  },
];

export const steps = [
  {
    title: "Pick a date",
    body: "Choose the session that suits your mood, then send us a DM on Instagram. We hold your seat and send the address.",
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

/** Work made *in the room* — the wall of things girlies took home. */
export const gallery = [
  {
    image: shaggyRug,
    alt: "Dense multicoloured shaggy crocheted rug",
    handle: "@sarah.k",
    session: "Colour Riot, Nov",
    likes: 234,
    dot: "var(--lime)",
    featured: true,
    span: "tall",
  },
  {
    image: patchwork,
    alt: "Granny-square patchwork blanket in jewel tones over a sofa",
    handle: "@cozy.creations",
    session: "Granny Squares, Oct",
    likes: 189,
    dot: "var(--blush)",
  },
  {
    image: rainbowBeanie,
    alt: "Rainbow-striped crocheted beanie photographed outdoors",
    handle: "@emma.makes",
    session: "Beanie Night, Dec",
    likes: 312,
    dot: "var(--mint)",
  },
  {
    image: mustardThrow,
    alt: "Mustard cable-knit throw folded over a white armchair",
    handle: "@lisa.c",
    session: "Slow Sunday, Jan",
    likes: 267,
    dot: "var(--coral)",
  },
  {
    image: meshBag,
    alt: "Lime open-mesh crocheted market bag laid out on a grey knit jumper",
    handle: "@jenny.stitches",
    session: "Market Bag, Sep",
    likes: 421,
    dot: "var(--lime)",
  },
  {
    image: blanket,
    alt: "Chevron-striped handmade blanket in blues and pinks",
    handle: "@nour.makes",
    session: "Ripple Blanket, Nov",
    likes: 398,
    dot: "#2b4cf5",
    featured: true,
    span: "tall",
  },
  {
    image: starBlanket,
    alt: "Pink and cream twelve-point star blanket seen from above",
    handle: "@amal.b",
    session: "Star Blanket, Dec",
    likes: 189,
    dot: "var(--pink-soft)",
  },
  {
    image: meshInProgress,
    alt: "Hands working a lime mesh crochet panel with a hook, yarn ball resting on a red bag",
    handle: "@happy.hooker",
    session: "First Loops, Jan",
    likes: 356,
    dot: "var(--orange)",
  },
  {
    image: tote,
    alt: "Striped crocheted tote bag in coral, olive and cream with wooden handles",
    handle: "@salma.t",
    session: "Flower Market Bag, Oct",
    likes: 274,
    dot: "var(--amber)",
  },
  {
    image: beanie,
    alt: "Chunky olive-green hand-crocheted beanie",
    handle: "@craft.with.me",
    session: "Beanie Night, Dec",
    likes: 198,
    dot: "var(--amber)",
  },
];

export const membership = {
  eyebrow: "Season pass",
  name: "The Girlies Pass",
  price: 500,
  perSeat: `Works out at ${price(250)} a session. Cancel any month.`,
  badge: "Coming soon",
  chip: "2 sessions / month",
  overlay: "Every craft, every month",
  quote: "Every stitch feels good, every project feels like a win.",
  quoteBy: "Imane, a regular since March",
  social: "Opening soon — DM us to get on the list",
  benefits: [
    { icon: "box", text: "Two full workshops every month", tone: "#dcfce7" },
    { icon: "trend", text: "Crochet, peinture, broderie — switch crafts whenever", tone: "#fce7f3" },
    { icon: "spark", text: "First pick of seats before public booking", tone: "#dbeafe" },
    { icon: "bolt", text: "Members-only evenings and studio open hours", tone: "#dcfce7" },
    { icon: "heart", text: "Bring a friend once a month, on us", tone: "#fce7f3" },
  ],
};

export const testimonials = [
  {
    quote:
      "I booked alone and spent the whole drive there panicking about it. By the tea break I had four new numbers in my phone.",
    name: "Maya Chen",
    role: "Came solo, stayed for six sessions",
    avatar: maya,
    surface: "linear-gradient(150deg, #fccee8 0%, #ff8c8c 100%)",
  },
  {
    quote:
      "Two hours where nobody could reach me and I made an actual flower with my hands. Cheaper than therapy and I got a garland out of it.",
    name: "Lisa Taylor",
    role: "Therapist (yes, really)",
    avatar: lisa,
    surface: "linear-gradient(150deg, #ffedd4 0%, #fef3c6 100%)",
  },
  {
    quote:
      "Painted on the Sunday, hung it on the Monday. Got 15 DMs asking where I bought it. Told them I made it. 😎",
    name: "Monica Stone",
    role: "Paint & sip regular",
    avatar: monica,
    surface: "linear-gradient(150deg, #ffefa7 0%, #ffb753 100%)",
  },
  {
    quote:
      "I have never once finished a craft project at home. Finished this one before the session ended. Turns out I just needed someone sitting next to me.",
    name: "Samantha Ray",
    role: "First-timer, Jan session",
    avatar: samantha,
    surface: "linear-gradient(150deg, #bedbff 0%, #abbffb 100%)",
  },
  {
    quote:
      "Booked it as a birthday thing for six of us. The girls still talk about it. We're doing the drawing one next.",
    name: "Casey Kim",
    role: "Booked a private table",
    avatar: casey,
    surface: "linear-gradient(150deg, #a4f4cf 0%, #5ee9b5 100%)",
  },
  {
    quote:
      "My hands needed this. My brain needed this. It's the only two hours a month nobody in my house can find me. 10/10 no notes.",
    name: "Riley Morgan",
    role: "Mum of 3, on the pass",
    avatar: riley,
    surface: "linear-gradient(150deg, #f0fb7f 0%, #e4fb53 100%)",
  },
];

export const closing = {
  title: ["A table, a craft,", "and the girlies."],
  body: "Every session is two hours off your phone, in a room that smells like coffee, next to people who get it. Come alone — you won't leave alone.",
  chips: [
    { label: "A new craft every month" },
    { label: "All materials provided" },
    { label: "Pause café always included" },
    { label: "Come solo or bring the group" },
  ],
  cta: "See the next dates",
  fine: `Seats from ${price(250)}. Free reschedule up to 48 hours before.`,
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

export const faqs = [
  {
    q: "I've never done this before. Is that a problem?",
    a: "Not at all — most girlies arrive with zero experience. Every session starts from the very first step and someone is always at the table to help you untangle.",
  },
  {
    q: "Can I come on my own?",
    a: "Please do. Half the table usually comes solo, and the pause café is built for meeting people. You will not leave alone.",
  },
  {
    q: "Is it really women only?",
    a: "Yes — 100% femmes, every session. It's a space to create and switch off, and we keep it that way.",
  },
  {
    q: "What's included in the price?",
    a: "Everything: materials, tools, the pause café, and the finished piece you take home. Paint is set or baked before you leave where the craft needs it.",
  },
  {
    q: "How do I book a seat?",
    a: `Send a DM to ${site.handle} on Instagram with the session name. We confirm your seat and send you the address and the details.`,
  },
  {
    q: "Where do the workshops happen?",
    a: "In Casablanca. The exact spot depends on the session and comes with your booking confirmation.",
  },
  {
    q: "Can you come to my event?",
    a: "Yes — on se déplace. Birthdays, EVJF, baby showers, team days. DM us the date, the headcount and the craft you like.",
  },
  {
    q: "What if I can't make it anymore?",
    a: "Tell us at least 48 hours before and we move you to another date for free.",
  },
];

export const footerLinks = [
  {
    heading: "Sessions",
    links: [
      { label: "Upcoming dates", href: "#sessions" },
      { label: "Crochet", href: "#workshops" },
      { label: "Peinture", href: "#workshops" },
      { label: "Broderie", href: "#sessions" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Private events", href: "#private" },
      { label: "Birthdays & EVJF", href: "#private" },
      { label: "FAQs", href: "#faq" },
      { label: "Book on Instagram", href: site.dm, external: true },
    ],
  },
];

export const socials = [
  { name: "Instagram", href: site.instagram, color: "var(--coral)", icon: "instagram" },
  { name: "Message us on Instagram", href: site.dm, color: "var(--lime)", icon: "message" },
];
