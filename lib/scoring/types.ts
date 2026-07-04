export type StatKey = "pac" | "sho" | "pas" | "dri" | "def" | "phy";
export type Stats = Record<StatKey, number>;
export type Profile = Record<StatKey, number>;

export type Finish = "bronze" | "silver" | "gold" | "totw" | "toty" | "icon" | "founder";
export type Position = "ST" | "RW" | "CAM" | "CM" | "CDM" | "CB";
export type Family = "Forward" | "Playmaker" | "Anchor";

export interface Signals {
  login: string; // YouTube handle, e.g. "@mrbeast"
  name: string;
  avatarUrl: string;
  location: string | null; // channel country
  subscribers: number;
  channel_age_years: number;
  video_count: number;
  total_views: number;
  avg_views_recent: number; // average views on recent videos
  category_count: number; // count of distinct categories
  rankedCategories?: string[];
  topCategory?: string | null;
  recent_uploads: number; // videos uploaded in the last year
  active_years: number;
  avg_likes_recent: number; // average likes on recent videos
  avg_comments_recent: number; // average comments on recent videos
  recent_spike: boolean; // recent views spike
}

export type WorkRateLevel = "High" | "Med" | "Low";

export interface Playstyle {
  name: string;
  icon: string; // lucide icon key, resolved in the UI
  plus: boolean; // elite "PlayStyle+" tier
  reason: string; // short, plain why-it-was-given
}

export interface Metric {
  label: string;
  value: number; // real YouTube count
  unit?: string; // optional noun
  score: number; // 0–99 normalization
}

export interface Report {
  skillMoves: number; // 1–5
  weakFoot: number; // 1–5
  workRate: { attack: WorkRateLevel; defense: WorkRateLevel };
  style: string;
  reasons: { skillMoves: string; weakFoot: string; workRate: string; style: string };
  playstyles: Playstyle[];
  metrics: Metric[];
}

export interface Archetype {
  name: string;
  blurb: string;
}

export interface FounderMeta {
  art: string; // root-relative card PNG, e.g. "/cards/founder-red.png"
  accent: string; // hex
  ink?: string;
  label: string;
  tagline: string;
}

export interface Card {
  login: string;
  name: string;
  avatarUrl: string;
  country: string;
  club: string;
  stats: Stats;
  position: Position;
  family: Family;
  baseOVR: number;
  overall: number;
  finish: Finish;
  finishLabel: string;
  archetype: string;
  archetypeBlurb: string;
  legacy: { L: number };
  topCategory?: string | null;
  categoryLogo?: { name: string; slug: string } | null;
  founder?: FounderMeta;
  report: Report;
}
