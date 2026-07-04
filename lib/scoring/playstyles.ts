import { formatCount } from "../format";
import type { Playstyle, Signals } from "./types";

interface PlaystyleDef {
  name: string;
  icon: string; // lucide icon key
  noun: string;
  value: (s: Signals) => number;
  base: number;
  plus: number;
}

const CATALOG: PlaystyleDef[] = [
  { name: "Sub Magnet", icon: "star", noun: "subscribers", value: (s) => s.subscribers, base: 100_000, plus: 10_000_000 },
  { name: "Viral Surge", icon: "flame", noun: "recent average views", value: (s) => s.avg_views_recent, base: 1_000_000, plus: 20_000_000 },
  { name: "Consistent", icon: "zap", noun: "uploads this year", value: (s) => s.recent_uploads, base: 24, plus: 100 },
  { name: "View Engine", icon: "tv", noun: "total views", value: (s) => s.total_views, base: 100_000_000, plus: 5_000_000_000 },
  { name: "Upload Machine", icon: "video", noun: "total videos", value: (s) => s.video_count, base: 500, plus: 3_000 },
  { name: "Engager", icon: "message-square", noun: "recent average comments", value: (s) => s.avg_comments_recent, base: 500, plus: 10_000 },
  { name: "Community Choice", icon: "thumbs-up", noun: "recent average likes", value: (s) => s.avg_likes_recent, base: 10_000, plus: 200_000 },
  { name: "Multifaceted", icon: "layout-grid", noun: "genres covered", value: (s) => s.category_count, base: 3, plus: 5 },
  { name: "Veteran", icon: "clock", noun: "years on YouTube", value: (s) => s.channel_age_years, base: 5, plus: 12 },
];

const MAX_SHOWN = 8;

export function derivePlaystyles(s: Signals): Playstyle[] {
  return CATALOG.map((def) => ({ def, val: def.value(s) }))
    .filter(({ def, val }) => val >= def.base)
    .sort((a, b) => {
      const ap = a.val >= a.def.plus;
      const bp = b.val >= b.def.plus;
      if (ap !== bp) return ap ? -1 : 1;
      return b.val / b.def.base - a.val / a.def.base;
    })
    .slice(0, MAX_SHOWN)
    .map(({ def, val }) => ({
      name: def.name,
      icon: def.icon,
      plus: val >= def.plus,
      reason: `${formatCount(val)} ${def.noun}${val >= def.plus ? " — elite tier" : ""}.`,
    }));
}
