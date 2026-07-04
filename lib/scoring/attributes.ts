import { formatCount } from "../format";
import { STATS } from "./constants";
import type { Metric, Signals, Stats, WorkRateLevel } from "./types";

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

const score99 = (value: number, ref: number) =>
  value <= 0 ? 0 : clamp(Math.round(99 * (Lg(value) / Lg(ref))), 1, 99);

// Skill moves (1–5) = variety of content: category count, +1 for deep library of videos.
export function deriveSkillMoves(s: Signals): { value: number; reason: string } {
  let value = s.category_count >= 4 ? 5 : s.category_count >= 3 ? 4 : s.category_count >= 2 ? 3 : 2;
  const bonus = s.video_count >= 200 && value < 5;
  if (bonus) value += 1;
  const reason = `Category range: ${s.category_count} unique content genre${s.category_count === 1 ? "" : "s"}${
    bonus ? ` across ${formatCount(s.video_count)} videos` : ""
  }.`;
  return { value, reason };
}

// Weak foot (1–5) = off-foot ability: how balanced the creator's stats are.
export function deriveWeakFoot(stats: Stats): { value: number; reason: string } {
  const sorted = STATS.map((k) => stats[k]).sort((a, b) => a - b);
  const weakSide = Math.round((sorted[0] + sorted[1] + sorted[2]) / 3);
  const value = weakSide >= 72 ? 5 : weakSide >= 63 ? 4 : weakSide >= 54 ? 3 : weakSide >= 45 ? 2 : 1;
  return { value, reason: `Off-foot: your three weakest stats average ${weakSide}/99.` };
}

const rate = (v: number): WorkRateLevel => (v >= 68 ? "High" : v >= 50 ? "Med" : "Low");

// Work rate: attack = view-pull & upload speed (PAC/SHO), defense = user approval/likes (DEF).
export function deriveWorkRate(stats: Stats): { attack: WorkRateLevel; defense: WorkRateLevel; reason: string } {
  const attack = rate(Math.round((stats.pac + stats.sho) / 2));
  const defense = rate(stats.def);
  return {
    attack,
    defense,
    reason: `Attack ${attack} from view-pull & uploads; defense ${defense} from community like ratios.`,
  };
}

// Style: a one-word read of the recent activity pattern.
export function deriveStyle(s: Signals): { value: string; reason: string } {
  if (s.recent_spike) return { value: "Explosive", reason: "A recent viral view surge well above your usual baseline." };
  if (s.recent_uploads >= 100)
    return { value: "Relentless", reason: "Uploading constantly, maintaining a packed schedule." };
  if (s.channel_age_years >= 6 && s.active_years >= 5)
    return { value: "Controlled", reason: "A long, steady and seasoned track record." };
  if (s.subscribers >= 10000000 && s.recent_uploads < 12)
    return { value: "Clinical", reason: "Massive subscriber reach with highly selective uploads." };
  if (s.recent_uploads >= 25) return { value: "Industrious", reason: "Regularly active with frequent content drops." };
  return { value: "Measured", reason: "Calm and selective uploading schedule." };
}

interface MetricDef {
  label: string;
  unit: string;
  ref: number; // value that maps to ~99
  value: (s: Signals) => number;
}

const CORE_METRICS: MetricDef[] = [
  { label: "Subscribers", unit: "subs", ref: 100_000_000, value: (s) => s.subscribers },
  { label: "Total Views", unit: "views", ref: 10_000_000_000, value: (s) => s.total_views },
  { label: "Avg Views", unit: "views/vid", ref: 10_000_000, value: (s) => s.avg_views_recent },
  { label: "Avg Likes", unit: "likes/vid", ref: 500_000, value: (s) => s.avg_likes_recent },
  { label: "Avg Comments", unit: "comments/vid", ref: 20_000, value: (s) => s.avg_comments_recent },
  { label: "Uploads Year", unit: "videos", ref: 150, value: (s) => s.recent_uploads },
  { label: "Videos", unit: "videos", ref: 5_000, value: (s) => s.video_count },
  { label: "Categories", unit: "genres", ref: 6, value: (s) => s.category_count },
];

const OPTIONAL_METRICS: MetricDef[] = [
  { label: "Channel Age", unit: "yrs", ref: 15, value: (s) => Math.round(s.channel_age_years) },
  { label: "Active Years", unit: "yrs", ref: 15, value: (s) => s.active_years },
];

const toMetric = (def: MetricDef, s: Signals): Metric => {
  const value = def.value(s);
  return { label: def.label, value, unit: def.unit, score: score99(value, def.ref) };
};

export function deriveMetrics(s: Signals): Metric[] {
  const core = CORE_METRICS.map((d) => toMetric(d, s));
  const shown = core.filter((m) => m.value > 0);
  const fillerCount = Math.max(0, core.length - shown.length - 1);
  const fillers = OPTIONAL_METRICS.map((d) => toMetric(d, s))
    .filter((m) => m.value > 0)
    .slice(0, fillerCount);
  return [...shown, ...fillers];
}
