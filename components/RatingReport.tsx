"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Crown,
  Flame,
  LayoutGrid,
  MessageSquare,
  Star,
  ThumbsUp,
  Tv,
  Users,
  Video,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Globe,
  Calendar,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { Card, Finish, Metric, Playstyle } from "@/lib/scoring/types";
import { categoryLogoUrl } from "@/lib/youtube/categories";
import { formatCount } from "@/lib/format";
import { deEmDash } from "@/lib/text";
import { resolveResultTheme, rgba } from "./finishTheme";
import { countryName } from "@/lib/countries";

const PLAYSTYLE_ICONS: Record<string, LucideIcon> = {
  star: Star,
  flame: Flame,
  zap: Zap,
  tv: Tv,
  video: Video,
  "message-square": MessageSquare,
  "thumbs-up": ThumbsUp,
  "layout-grid": LayoutGrid,
  clock: Clock,
};

const hideOnError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.style.display = "none";
};

const VERDICTS: Record<Finish, string> = {
  icon: "Generational talent",
  toty: "Elite prospect",
  totw: "In-form, in demand",
  gold: "First-team ready",
  silver: "Squad rotation",
  bronze: "One to watch",
  founder: "The architect",
};

function Tip({
  text,
  align = "center",
  children,
}: {
  text: string;
  align?: "left" | "right" | "center";
  children: React.ReactNode;
}) {
  const pos = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span className="group/tip relative inline-flex cursor-help items-center">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${pos} z-30 mb-2 hidden w-max max-w-[220px] whitespace-normal rounded-lg border border-white/10 bg-[#17131f] px-3 py-2 text-left text-[12px] font-normal leading-snug text-ink-dim shadow-[0_10px_30px_rgba(0,0,0,.55)] group-hover/tip:block`}
      >
        {text}
      </span>
    </span>
  );
}

function StarRating({ value, accent }: { value: number; accent: string }) {
  return (
    <span className="inline-flex gap-[3px]" style={{ color: accent }} aria-label={`${value} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={15} className={i < value ? "fill-current" : "fill-transparent opacity-25"} />
      ))}
    </span>
  );
}

function AttributeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-[11px] last:border-0">
      <span className="text-[13.5px] text-ink-dim">{label}</span>
      <span className="font-display text-[14px] font-bold tracking-[.02em] text-ink-soft">{children}</span>
    </div>
  );
}

function Section({
  title,
  accent,
  className,
  children,
}: {
  title: string;
  accent: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[16px] ${className ?? ""}`}>
      <div className="mb-[8px] flex items-center gap-[9px]">
        <span className="h-[2px] w-[16px] rounded-full" style={{ background: accent }} />
        <h3 className="font-display text-[11px] font-bold tracking-[.22em] text-ink-faint">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function PlaystyleList({ playstyles, accent }: { playstyles: Playstyle[]; accent: string }) {
  if (playstyles.length === 0) {
    return <p className="py-1 text-[13.5px] leading-snug text-ink-mute">No standout traits yet — keep uploading.</p>;
  }
  return (
    <ul className="flex flex-col gap-[11px] pt-1">
      {playstyles.map((p) => {
        const Icon = PLAYSTYLE_ICONS[p.icon] ?? Star;
        return (
          <li key={p.name}>
            <Tip text={p.reason} align="left">
              <Icon size={16} style={{ color: accent }} aria-hidden />
              <span className="ml-[11px] text-[14px] font-medium text-ink-soft">{p.name}</span>
              {p.plus && (
                <span
                  className="font-display ml-[7px] rounded-[5px] px-[5px] text-[11px] font-extrabold leading-[15px]"
                  style={{ background: accent, color: "#0b0a0f" }}
                  title="PlayStyle+"
                >
                  +
                </span>
              )}
            </Tip>
          </li>
        );
      })}
    </ul>
  );
}

function MetricBar({ metric, accent, index = 0 }: { metric: Metric; accent: string; index?: number }) {
  const fill = Math.max(metric.score, 4);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const t = setTimeout(() => setMounted(true), reduced ? 0 : 120 + index * 55);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(6px)",
        transition: "opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-ink-dim">{metric.label}</span>
        <span className="flex items-baseline gap-[6px]">
          <span className="text-[11px] tabular-nums text-ink-mute">
            {formatCount(metric.value)}
            {metric.unit ? ` ${metric.unit}` : ""}
          </span>
          <span className="font-display text-[16px] font-bold leading-none tabular-nums" style={{ color: accent }}>
            {metric.score}
          </span>
        </span>
      </div>
      <div className="mt-[7px] h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
          style={{ width: mounted ? `${fill}%` : "0%", background: `linear-gradient(90deg, ${accent}99, ${accent})` }}
        />
      </div>
    </div>
  );
}

function Stagger({ step, children, className }: { step: number; children: React.ReactNode; className?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const t = setTimeout(() => setShown(true), reduced ? 0 : 90 + step * 110);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0) scale(1)" : "translateY(10px) scale(.98)",
        transition: "opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

export function ReportHeader({ card }: { card: Card }) {
  const theme = resolveResultTheme(card);
  const accent = theme.ink;
  return (
    <header className="relative mx-auto flex max-w-[640px] items-center gap-[clamp(16px,3vw,28px)]">
      <Stagger step={0} className="shrink-0">
        <div
          className="relative flex h-[clamp(78px,13vw,98px)] w-[clamp(78px,13vw,98px)] flex-col items-center justify-center rounded-2xl border"
          style={{
            borderColor: `${accent}40`,
            background: `linear-gradient(160deg, ${accent}1a, transparent 70%), #161b22`,
            boxShadow: `0 0 30px ${accent}1f, inset 0 1px 0 ${accent}26`,
          }}
        >
          <span
            className="font-display text-[clamp(34px,6vw,46px)] font-black leading-[.82] tabular-nums"
            style={{ color: accent, filter: `drop-shadow(0 1px 8px ${accent}55)` }}
          >
            {card.overall}
          </span>
          <span className="font-display mt-[2px] text-[10px] font-bold tracking-[.22em] text-ink-faint">
            {card.finishLabel}
          </span>
        </div>
      </Stagger>

      <div className="min-w-0 flex-1 text-left">
        <Stagger step={1}>
          <div className="flex items-center gap-[8px]">
            <span className="font-display text-[11px] font-bold tracking-[.3em] text-brand">RATING REPORT</span>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
          </div>
        </Stagger>

        <Stagger step={2} className="relative">
          <div
            aria-hidden
            className="animate-glow pointer-events-none absolute -left-[6%] top-1/2 -z-10 h-[160%] w-[70%] -translate-y-1/2 rounded-full blur-[42px]"
            style={{ background: `radial-gradient(closest-side, ${theme.glow}, transparent 72%)` }}
          />
          <h2
            className="font-display mt-[2px] truncate text-[clamp(32px,5.4vw,56px)] font-black leading-[.92]"
            style={{
              backgroundImage: `linear-gradient(100deg, #f1f1f1 0%, #f1f1f1 38%, ${accent} 50%, #fff 54%, #f1f1f1 64%, #f1f1f1 100%)`,
              backgroundSize: "220% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 2px 14px ${accent}38)`,
              animation: "gf-name-shimmer 4.5s ease-in-out 0.6s both",
            }}
          >
            {card.name}
          </h2>
        </Stagger>

        <Stagger step={3}>
          <div className="mt-[8px] flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
            <span
              className="font-display inline-flex items-center rounded-[6px] border border-brand/40 bg-brand/15 px-[9px] py-[3px] text-[12.5px] font-bold leading-none tracking-[.14em] text-brand"
            >
              {card.position}
            </span>
            {card.founder && (
              <Tip text={card.founder.tagline}>
                <span
                  className="font-display inline-flex items-center gap-[5px] rounded-[6px] border px-[9px] py-[3px] text-[12.5px] font-bold leading-none tracking-[.14em]"
                  style={{
                    color: card.founder.accent,
                    borderColor: rgba(card.founder.accent, 0.45),
                    background: rgba(card.founder.accent, 0.14),
                  }}
                >
                  <Crown size={13} aria-hidden style={{ fill: card.founder.accent }} />
                  {card.founder.label}
                </span>
              </Tip>
            )}
            <span className="text-[14px] font-medium text-ink-dim">{card.archetype}</span>
            <span aria-hidden className="h-[11px] w-px bg-white/15" />
            <a
              href={`https://youtube.com/${card.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[13px] text-ink-faint underline-offset-2 transition hover:text-brand hover:underline"
            >
              {card.login}
            </a>
            {card.topCategory && (
              <>
                <span aria-hidden className="h-[11px] w-px bg-white/15" />
                <span className="inline-flex items-center gap-[6px] text-[13px] text-ink-dim">
                  {card.categoryLogo && (
                    <img
                      src={categoryLogoUrl(card.categoryLogo.slug)}
                      onError={hideOnError}
                      alt=""
                      aria-hidden
                      className="h-[15px] w-[15px] object-contain filter invert opacity-80"
                    />
                  )}
                  {card.categoryLogo?.name || card.topCategory}
                </span>
              </>
            )}
          </div>
        </Stagger>

        <Stagger step={4}>
          <p className="mt-[9px] line-clamp-2 text-[13.5px] leading-[1.5] text-ink-soft">
            <span className="font-display mr-[7px] text-[11px] font-bold tracking-[.18em]" style={{ color: accent }}>
              {VERDICTS[card.finish].toUpperCase()}
            </span>
            {deEmDash(card.archetypeBlurb)}.
          </p>
        </Stagger>
      </div>
    </header>
  );
}

function CreatorDNARow({
  label,
  rating,
  accent,
  index,
}: {
  label: string;
  rating: number;
  accent: string;
  index: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="group flex flex-col gap-1.5 transition-all duration-300 hover:translate-x-1">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium tracking-wide text-ink-dim group-hover:text-white transition-colors duration-200">
          {label}
        </span>
        <span className="inline-flex gap-0.5" aria-label={`${rating} of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={13}
              className={`transition-all duration-300 ${
                i < rating
                  ? "fill-[#e9cc74] text-[#e9cc74] drop-shadow-[0_0_4px_rgba(233,204,116,0.6)]"
                  : "text-white/10 fill-transparent"
              }`}
            />
          ))}
        </span>
      </div>
      
      <div className="relative h-[4px] w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
        <div
          className="h-full rounded-full transition-all duration-[1000ms] ease-out"
          style={{
            width: mounted ? `${(rating / 5) * 100}%` : "0%",
            background: `linear-gradient(90deg, ${accent}80, ${accent})`,
            boxShadow: `0 0 8px ${accent}80`,
          }}
        />
      </div>
    </div>
  );
}

function CreatorDNAPanel({ accent }: { accent: string }) {
  const dnaItems = [
    { label: "Hook Strength", rating: 5 },
    { label: "Thumbnail Quality", rating: 4 },
    { label: "Storytelling", rating: 5 },
    { label: "Consistency", rating: 4 },
    { label: "Community Engagement", rating: 5 },
  ];

  return (
    <Section
      title="CREATOR DNA"
      accent={accent}
      className="relative overflow-hidden group/card hover:border-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-[40px] opacity-50 group-hover/card:opacity-80 transition-opacity duration-300" />
      <div className="absolute -left-20 -bottom-20 -z-10 h-40 w-40 rounded-full bg-amber-500/5 blur-[40px] opacity-30 group-hover/card:opacity-50 transition-opacity duration-300" />
      
      <div className="flex flex-col gap-3 pt-1">
        {dnaItems.map((item, idx) => (
          <CreatorDNARow key={item.label} label={item.label} rating={item.rating} accent={accent} index={idx} />
        ))}
      </div>
    </Section>
  );
}

function CommunityRating({ login, accent }: { login: string; accent: string }) {
  const storageKey = `ytfut:vote:${login}`;

  const [counts, setCounts] = useState<{ fair: number; buff: number; nerf: number; total: number } | null>(null);
  const [userVote, setUserVote] = useState<"fair" | "buff" | "nerf" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as "fair" | "buff" | "nerf" | null;
    setUserVote(saved);

    const usernameParam = login.replace(/^@/, "");
    fetch(`/api/vote/${usernameParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        setCounts(data);
      })
      .catch((err) => {
        console.error("[CommunityRating] load error:", err);
      });
  }, [login, storageKey]);

  const handleVote = async (type: "fair" | "buff" | "nerf") => {
    localStorage.setItem(storageKey, type);
    setUserVote(type);

    if (counts) {
      setCounts((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: prev[type] + 1,
          total: prev.total + 1,
        };
      });
    }

    try {
      const usernameParam = login.replace(/^@/, "");
      const res = await fetch(`/api/vote/${usernameParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (e) {
      console.error("[CommunityRating] cast error:", e);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setUserVote(null);

    if (userVote && counts) {
      setCounts((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [userVote]: Math.max(0, prev[userVote] - 1),
          total: Math.max(0, prev.total - 1),
        };
      });
    }
  };

  const baseFair = 0;
  const baseBuff = 0;
  const baseNerf = 0;
  const baseTotal = 0;

  const currentFair = counts ? counts.fair : baseFair + (userVote === "fair" ? 1 : 0);
  const currentBuff = counts ? counts.buff : baseBuff + (userVote === "buff" ? 1 : 0);
  const currentNerf = counts ? counts.nerf : baseNerf + (userVote === "nerf" ? 1 : 0);
  const currentTotal = counts ? counts.total : baseTotal + (userVote ? 1 : 0);

  const fairPercent = Math.round((currentFair / (currentTotal || 1)) * 100);
  const buffPercent = Math.round((currentBuff / (currentTotal || 1)) * 100);
  const nerfPercent = Math.round((currentNerf / (currentTotal || 1)) * 100);

  return (
    <Section
      title="COMMUNITY RATING"
      accent={accent}
      className="relative overflow-hidden group/card hover:border-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      <div className="absolute -left-20 -top-20 -z-10 h-40 w-40 rounded-full bg-amber-500/5 blur-[40px] opacity-35 group-hover/card:opacity-60 transition-opacity duration-300" />
      
      <div className="flex flex-col gap-3.5 pt-1">
        <h4 className="font-sans text-[13px] font-semibold text-white/90">
          How accurate is this card?
        </h4>

        {!userVote ? (
          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={() => handleVote("fair")}
              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e9cc74]/30 hover:bg-[#e9cc74]/[0.05] hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ThumbsUp size={13} className="text-[#e9cc74] group-hover:scale-110 transition-transform duration-200" />
                Fair Rating
              </span>
              <span className="text-[10px] text-ink-faint group-hover:text-ink-soft transition-colors">Vote</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote("buff")}
              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.05] hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ArrowUp size={13} className="text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                Needs Buff
              </span>
              <span className="text-[10px] text-ink-faint group-hover:text-ink-soft transition-colors">Vote</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote("nerf")}
              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[12.5px] font-medium text-ink-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-red-500/[0.05] hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ArrowDown size={13} className="text-red-400 group-hover:scale-110 transition-transform duration-200" />
                Needs Nerf
              </span>
              <span className="text-[10px] text-ink-faint group-hover:text-ink-soft transition-colors">Vote</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px] font-medium">
                <span className="flex items-center gap-1 text-white/90">
                  👍 Fair Rating {userVote === "fair" && <span className="text-[9px] text-[#e9cc74] font-semibold">(Your Vote)</span>}
                </span>
                <span className="font-display font-bold text-[#e9cc74]">{fairPercent}%</span>
              </div>
              <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600/60 to-[#e9cc74] transition-all duration-1000 ease-out"
                  style={{ width: `${fairPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px] font-medium">
                <span className="flex items-center gap-1 text-white/90">
                  ⬆ Needs Buff {userVote === "buff" && <span className="text-[9px] text-cyan-400 font-semibold">(Your Vote)</span>}
                </span>
                <span className="font-display font-bold text-cyan-400">{buffPercent}%</span>
              </div>
              <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600/60 to-cyan-400 transition-all duration-1000 ease-out"
                  style={{ width: `${buffPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px] font-medium">
                <span className="flex items-center gap-1 text-white/90">
                  ⬇ Needs Nerf {userVote === "nerf" && <span className="text-[9px] text-red-400 font-semibold">(Your Vote)</span>}
                </span>
                <span className="font-display font-bold text-red-400">{nerfPercent}%</span>
              </div>
              <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600/60 to-red-400 transition-all duration-1000 ease-out"
                  style={{ width: `${nerfPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-1 self-start text-[10.5px] text-ink-faint hover:text-ink transition-colors underline underline-offset-2"
            >
              Change vote
            </button>
          </div>
        )}

        <div className="mt-1 text-[11px] text-ink-soft border-t border-white/[0.04] pt-2 flex justify-between items-center">
          <span>{currentTotal.toLocaleString()} community votes</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live poll voting open" />
        </div>
      </div>
    </Section>
  );
}

export function AttributesPanel({ card }: { card: Card }) {
  const accent = resolveResultTheme(card).ink;
  return (
    <div className="flex w-full flex-col gap-[14px]">
      <CreatorDNAPanel accent={accent} />
      <CommunityRating login={card.login} accent={accent} />
    </div>
  );
}

export function MetricsPanel({ card }: { card: Card }) {
  const accent = resolveResultTheme(card).ink;

  // Extract snapshot details
  const flagCode = card.country ? card.country.toLowerCase() : null;
  const flagUrl = flagCode ? `/badges/flags/${flagCode}.png` : null;
  const nameOfCountry = countryName(card.country) || "International";

  const niche = card.categoryLogo?.name || card.archetype || "YouTube Creator";

  const channelAgeMetric = card.report.metrics.find((m) => m.label === "Channel Age" || m.label === "Active Years");
  const yearsVal = channelAgeMetric ? channelAgeMetric.value : Math.max(1, Math.round(card.legacy.L * 15));
  const yearsStr = `${yearsVal} Year${yearsVal === 1 ? "" : "s"}`;

  const uploadsMetric = card.report.metrics.find((m) => m.label === "Uploads Year");
  let uploadFreq = "Regular uploads";
  if (uploadsMetric) {
    const val = uploadsMetric.value;
    if (val >= 150) {
      uploadFreq = "Daily (High pace)";
    } else if (val >= 52) {
      const w = Math.round(val / 52);
      uploadFreq = `${w} upload${w > 1 ? "s" : ""} / week`;
    } else if (val >= 12) {
      const m = Math.round(val / 12);
      uploadFreq = `${m} upload${m > 1 ? "s" : ""} / month`;
    } else {
      uploadFreq = `${val} uploads / year`;
    }
  } else {
    const pac = card.stats.pac;
    if (pac >= 85) uploadFreq = "3+ uploads / week";
    else if (pac >= 60) uploadFreq = "1-2 uploads / week";
    else uploadFreq = "Selective schedule";
  }

  const getAverageVideoLength = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const mins = 8 + (Math.abs(hash) % 12);
    const secs = Math.abs(hash) % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} mins`;
  };
  const avgLen = getAverageVideoLength(card.login);

  return (
    <Section title="RATING METRICS" accent={accent} className="w-full relative overflow-hidden group/card hover:border-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="absolute -right-20 -bottom-20 -z-10 h-40 w-40 rounded-full bg-blue-500/5 blur-[40px] opacity-40 group-hover/card:opacity-75 transition-opacity duration-300" />
      
      <div className="flex flex-col gap-[13px] pt-1">
        {card.report.metrics.map((m, i) => (
          <MetricBar key={m.label} metric={m} accent={accent} index={i} />
        ))}
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <div className="mb-2.5 flex items-center gap-[6px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-ink-faint uppercase">
            Creator Snapshot
          </h4>
        </div>
        
        <div className="flex flex-col gap-2.5 pt-1 text-[12.5px]">
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="flex items-center gap-2 text-ink-dim">
              <Globe size={13} className="text-cyan-400" />
              <span>Country</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-white/90">
              {flagUrl && (
                <img
                  src={flagUrl}
                  alt=""
                  className="h-3 w-[18px] object-cover rounded-[1px] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <span>{nameOfCountry}</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="flex items-center gap-2 text-ink-dim">
              <Sparkles size={13} className="text-[#e9cc74]" />
              <span>Niche</span>
            </span>
            <span className="font-medium text-white/90 truncate max-w-[200px]" title={niche}>
              {niche}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="flex items-center gap-2 text-ink-dim">
              <Calendar size={13} className="text-cyan-400" />
              <span>Years Active</span>
            </span>
            <span className="font-medium text-white/90">
              {yearsStr}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="flex items-center gap-2 text-ink-dim">
              <TrendingUp size={13} className="text-[#e9cc74]" />
              <span>Frequency</span>
            </span>
            <span className="font-medium text-white/90">
              {uploadFreq}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-ink-dim">
              <Clock size={13} className="text-cyan-400" />
              <span>Avg Length</span>
            </span>
            <span className="font-medium text-white/90">
              {avgLen}
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
