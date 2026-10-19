import type { ImageMetadata } from "astro";

import crochetDaisies from "../assets/workshops/crochet.jpg";
import blanket from "../assets/workshops/blanket.png";
import beanie from "../assets/workshops/beanie.png";
import tote from "../assets/workshops/tote.png";
import mustardThrow from "../assets/community/mustard-throw.png";
import starBlanket from "../assets/community/star-blanket.jpg";
import yarnBasket from "../assets/community/yarn-basket.png";
import sunflowerBags from "../assets/community/sunflower-bags.jpg";
import shaggyRug from "../assets/community/shaggy-rug.jpg";
import forgetMeNots from "../assets/community/forget-me-nots.jpg";
import patchwork from "../assets/community/patchwork.png";
import rainbowBeanie from "../assets/community/rainbow-beanie.png";
import yarnBowl from "../assets/community/yarn-bowl.png";
import pinkTote from "../assets/community/pink-tote.png";
import meshBag from "../assets/crochet.jpeg";
import meshInProgress from "../assets/crochet1.jpeg";
import paintedGlass from "../assets/kas_kabir.jpeg";
import glassParty from "../assets/kissan.jpeg";
import paintedMirror from "../assets/mirror_flower.jpeg";
import paintedTote from "../assets/totbag.jpeg";
import maya from "../assets/people/maya.png";
import lisa from "../assets/people/lisa.png";
import monica from "../assets/people/monica.png";
import samantha from "../assets/people/samantha.png";
import casey from "../assets/people/casey.png";
import riley from "../assets/people/riley.png";

/**
 * Photos that ship with the site. The database refers to them as
 * `asset:<key>`; uploaded photos are `media:<id>` (see lib/images.ts).
 */
export const library: Record<string, { image: ImageMetadata; label: string }> = {
  "crochet-daisies": { image: crochetDaisies, label: "Crochet daisies" },
  "mesh-bag": { image: meshBag, label: "Lime mesh bag" },
  "mesh-in-progress": { image: meshInProgress, label: "Mesh bag in progress" },
  "sunflower-bags": { image: sunflowerBags, label: "Sunflower market bags" },
  "painted-mirror": { image: paintedMirror, label: "Painted tulip mirror" },
  "painted-glass": { image: paintedGlass, label: "Painted daisy glass" },
  "glass-party": { image: glassParty, label: "Glass painting party" },
  "painted-tote": { image: paintedTote, label: "Painted tote bag" },
  "shaggy-rug": { image: shaggyRug, label: "Shaggy rug" },
  patchwork: { image: patchwork, label: "Patchwork blanket" },
  "rainbow-beanie": { image: rainbowBeanie, label: "Rainbow beanie" },
  "mustard-throw": { image: mustardThrow, label: "Mustard throw" },
  blanket: { image: blanket, label: "Ripple blanket" },
  "star-blanket": { image: starBlanket, label: "Star blanket" },
  tote: { image: tote, label: "Striped tote" },
  beanie: { image: beanie, label: "Olive beanie" },
  "forget-me-nots": { image: forgetMeNots, label: "Forget-me-nots" },
  "yarn-basket": { image: yarnBasket, label: "Yarn basket" },
  "yarn-bowl": { image: yarnBowl, label: "Yarn bowl" },
  "pink-tote": { image: pinkTote, label: "Pink tote" },
  maya: { image: maya, label: "Avatar — Maya" },
  lisa: { image: lisa, label: "Avatar — Lisa" },
  monica: { image: monica, label: "Avatar — Monica" },
  samantha: { image: samantha, label: "Avatar — Samantha" },
  casey: { image: casey, label: "Avatar — Casey" },
  riley: { image: riley, label: "Avatar — Riley" },
};
