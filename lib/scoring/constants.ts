import type { Family, Finish, FounderMeta, StatKey, Stats } from "./types";

export const STATS: StatKey[] = ["pac", "sho", "pas", "dri", "def", "phy"];

export const ATTACK_STATS: StatKey[] = ["pac", "sho", "pas", "dri"];

export const K = {
  magnitude: { w1: 0.5, w2: 0.4, w3: 0.5, w4: 0.08, b: -8.5, lo: 48, hi: 82 },
  tension: {
    alpha: 0.7,
    pairs: [
      ["sho", "def"],
      ["dri", "phy"],
      ["pac", "def"],
    ] as [StatKey, StatKey][],
  },
  spike: { base: 8, cohesion: 0.6 },
  legacy: { a: 1.0, b: 0.7, c: 0.3, d: 0.3, e: 0.3, f: 7.5, activeCap: 15, bonusMax: 11 },
  ovrCap: 88,
  finish: { iconMin: 90, totyMin: 85, totyLegacy: 0.85, goldMin: 75, goldLegacy: 0.5, silverMin: 65, silverLegacy: 0.2 },
  iconAllowlist: ["@pewdiepie", "@mrbeast", "@mkbhd"],
};

export const WEIGHTS: Record<Family, Stats> = {
  Forward: { pac: 0.2, sho: 0.3, pas: 0.1, dri: 0.2, def: 0.05, phy: 0.15 },
  Playmaker: { pac: 0.1, sho: 0.15, pas: 0.3, dri: 0.25, def: 0.1, phy: 0.1 },
  Anchor: { pac: 0.1, sho: 0.05, pas: 0.15, dri: 0.1, def: 0.4, phy: 0.2 },
};

export const FINISH_LABELS: Record<Finish, string> = {
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  totw: "IN-FORM",
  toty: "TOTY",
  icon: "ICON",
  founder: "FOUNDER",
};