import tulip from "../assets/flowers/Tulip.png";

/** One bloom only — the tulip, scattered beside the sessions grid. */
export const flowers = {
  tulip,
} as const;

export type FlowerName = keyof typeof flowers;
