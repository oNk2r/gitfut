import { countryForLogin } from "../geo";
import { topCategoryLogo } from "../youtube/categories";
import { deriveMetrics, deriveSkillMoves, deriveStyle, deriveWeakFoot, deriveWorkRate } from "./attributes";
import { ATTACK_STATS, FINISH_LABELS, FOUNDER_OVERALL, FOUNDERS, K, STATS, WEIGHTS } from "./constants";
import { derivePlaystyles } from "./playstyles";
import type {
  Archetype,
  Card,
  Family,
  Finish,
  Position,
  Profile,
  Signals,
  StatKey,
  Stats,
} from "./types";

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const vals = (s: Profile) => STATS.map((k) => s[k]);

// §2 — raw estimates, tuned so the six land on a comparable scale.
function rawStats(s: Signals): Stats {
  const o: Stats = {
    pac: 30 + 15 * Lg(s.recent_uploads),
    sho: 20 + 10 * Lg(s.avg_views_recent),
    pas: 30 + 8 * Lg(s.avg_comments_recent) + 6 * Lg(s.avg_likes_recent),
    dri: 50 + 12 * Math.sqrt(s.category_count),
    def: clamp(Math.round(40 + 800 * (s.avg_likes_recent / (s.avg_views_recent || 1))), 1, 99),
    phy: 25 + 5 * Lg(s.total_views) + 3.0 * Math.min(s.active_years, 12),
  };
  for (const k of STATS) o[k] = clamp(Math.round(o[k]), 1, 99);
  return o;
}

// §3.1 — magnitude → gravity-well center the stats sit around.
function center(s: Signals): number {
  const { w1, w2, w3, w4, b, lo, hi } = K.magnitude;
  const M = sigmoid(
    w1 * Lg(s.total_views) +
      w2 * Lg(s.subscribers) +
      w3 * Lg(s.avg_views_recent) +
      w4 * s.channel_age_years +
      b,
  );
  return lerp(lo, hi, M);
}

// §3.2 — z-score of their own six.
function zscore(raw: Stats): Profile {
  const v = vals(raw);
  const m = mean(v);
  const sd = Math.sqrt(mean(v.map((x) => (x - m) ** 2))) || 1;
  const p = {} as Profile;
  STATS.forEach((k, i) => (p[k] = (v[i] - m) / sd));
  return p;
}

// §3.3 — penalise antagonist pairs so nobody is elite at everything.
function applyTension(p: Profile): Profile {
  const out = { ...p };
  for (const [a, b] of K.tension.pairs) {
    const overlap = Math.max(0, Math.min(out[a], out[b]));
    const weaker = out[a] <= out[b] ? a : b;
    out[weaker] -= K.tension.alpha * overlap;
  }
  return out;
}

// §3.4 — spike around center; specialists get spikier cards.
function spike(p: Profile, c: number): Stats {
  const v = vals(p);
  const lop = clamp((Math.max(...v) - Math.min(...v)) / 4, 0, 1);
  const spread = K.spike.base * (1 + lop);
  const m = mean(v);
  const raw = {} as Stats;
  STATS.forEach((k) => (raw[k] = c + spread * (p[k] - m)));
  // §3.5 — attacking cohesion: the technical four share sub-skills, so pull them
  // toward their own group mean (preserving order and their collective level)
  // before rounding.
  const am = mean(ATTACK_STATS.map((k) => raw[k]));
  ATTACK_STATS.forEach((k) => (raw[k] = am + K.spike.cohesion * (raw[k] - am)));
  const stats = {} as Stats;
  STATS.forEach((k) => (stats[k] = clamp(Math.round(raw[k]), 1, 99)));
  return stats;
}

function positionFromShape(st: Stats): { position: Position; family: Family } {
  const fam: Record<Family, number> = {
    Forward: st.sho + st.pac,
    Playmaker: st.pas + st.dri,
    Anchor: st.def + st.phy,
  };
  const family = (Object.keys(fam) as Family[]).sort((a, b) => fam[b] - fam[a])[0];
  const position: Position =
    family === "Forward"
      ? st.pac > st.sho
        ? "RW"
        : "ST"
      : family === "Playmaker"
        ? st.pas > st.dri
          ? "CM"
          : "CAM"
        : st.def > st.phy
          ? "CB"
          : "CDM";
  return { position, family };
}

// §3.6 — position-weighted, never a flat mean; stats alone cap at 88.
function weightedOVR(stats: Stats, family: Family): number {
  const w = WEIGHTS[family];
  const ovr = STATS.reduce((s, k) => s + stats[k] * w[k], 0);
  return Math.min(Math.round(ovr), K.ovrCap);
}

// §4 — the 88→99 range is bought with years and sustained influence.
function legacyScore(s: Signals): number {
  const { a, b, c, d, e, f, activeCap } = K.legacy;
  const z =
    a * Math.log(s.channel_age_years + 1) +
    b * Math.min(s.active_years, activeCap) +
    c * Lg(s.subscribers) +
    d * Lg(s.total_views) +
    e * Lg(s.video_count) -
    f;
  return sigmoid(z);
}

function pickFinish(overall: number, L: number, recentSpike: boolean, login: string): Finish {
  if (K.iconAllowlist.includes(login.toLowerCase()) || overall >= K.finish.iconMin) return "icon";
  if (overall >= K.finish.totyMin && L >= K.finish.totyLegacy) return "toty";
  if (recentSpike && overall >= K.finish.silverMin) return "totw";
  if (overall >= K.finish.goldMin) return "gold";
  if (overall >= K.finish.silverMin) return "silver";
  return "bronze";
}

function archetypeFromShape(st: Stats, finish: Finish): Archetype {
  if (finish === "icon")
    return { name: "Galáctico", blurb: "hall-of-fame creator — high and balanced influence earned over years" };
  const top = [...STATS].sort((a, b) => st[b] - st[a]);
  const peak = st[top[0]];
  const top2 = top.slice(0, 2);
  const has = (a: StatKey, b: StatKey) => top2.includes(a) && top2.includes(b);
  if (top[0] === "sho" && st.def < peak - 18 && st.pas < peak - 12)
    return { name: "Poacher", blurb: "clinical viral hitter — high view-to-sub content pull" };
  if (top[0] === "pas" && top2.includes("def"))
    return { name: "Regista", blurb: "deep community linker — drives high comments and subscriber engagement" };
  if (top[0] === "def" && top2.includes("pas"))
    return { name: "Libero", blurb: "brand-safe creator — highly liked, stable and clean brand image" };
  if (top[0] === "dri")
    return { name: "Fantasista", blurb: "versatile entertainer — content covers multiple niches and categories" };
  if (has("phy", "sho")) return { name: "Target Man", blurb: "massive total output and view counts" };
  if (has("phy", "pac") || has("pac", "dri"))
    return { name: "Mezzala", blurb: "relentless upload engine — consistent frequent shipping" };
  if (top[0] === "def")
    return { name: "Libero", blurb: "brand-safe creator — highly liked, stable and clean brand image" };
  if (top[0] === "sho")
    return { name: "Poacher", blurb: "clinical viral hitter — high view-to-sub content pull" };
  return { name: "Mezzala", blurb: "relentless upload engine — consistent frequent shipping" };
}

export function buildCard(s: Signals): Card {
  const stats = spike(applyTension(zscore(rawStats(s))), center(s));
  const { position, family } = positionFromShape(stats);
  const baseOVR = weightedOVR(stats, family);
  const L = legacyScore(s);

  const loginLower = s.login.toLowerCase();
  const founder = FOUNDERS[loginLower] || FOUNDERS[loginLower.replace(/^@/, "")];
  const overall = founder
    ? FOUNDER_OVERALL[loginLower] || FOUNDER_OVERALL[loginLower.replace(/^@/, "")]
    : clamp(baseOVR + Math.round(K.legacy.bonusMax * L), 1, 99);
  const finish: Finish = founder ? "founder" : pickFinish(overall, L, s.recent_spike, s.login);
  const archetype = founder
    ? { name: "Founder", blurb: "co-founder of YTFut — they built the very rating engine reading this card" }
    : archetypeFromShape(stats, finish);
  const skill = deriveSkillMoves(s);
  const weak = deriveWeakFoot(stats);
  const work = deriveWorkRate(stats);
  const style = deriveStyle(s);

  const categoryLogo = topCategoryLogo(s.rankedCategories ?? []);
  return {
    login: s.login,
    name: s.name,
    avatarUrl: s.avatarUrl,
    country: s.location || countryForLogin(s.login.replace(/^@/, ""), s.location) || "",
    club: finish === "icon" ? "legends" : "neutral",
    stats,
    position,
    family,
    baseOVR,
    overall,
    finish,
    finishLabel: FINISH_LABELS[finish],
    archetype: archetype.name,
    archetypeBlurb: archetype.blurb,
    topCategory: s.topCategory ?? null,
    categoryLogo,
    ...(founder ? { founder } : null),
    legacy: { L },
    report: {
      skillMoves: skill.value,
      weakFoot: weak.value,
      workRate: { attack: work.attack, defense: work.defense },
      style: style.value,
      reasons: {
        skillMoves: skill.reason,
        weakFoot: weak.reason,
        workRate: work.reason,
        style: style.reason,
      },
      playstyles: derivePlaystyles(s),
      metrics: deriveMetrics(s),
    },
  };
}
