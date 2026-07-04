"use client";

import { forwardRef, type CSSProperties } from "react";
import type { Card } from "@/lib/scoring/types";
import PlayerCard from "./PlayerCard";
import { resolveCardTheme, resolveResultTheme } from "./finishTheme";

const STORY_W = 1080;
const STORY_H = 1920;

const SAFE_TOP = 250;
const SAFE_BOTTOM = 250;

const CARD_W = 606;
const CARD_H = Math.round(CARD_W * (820 / 540));

const BRAND = "#ff0000";

function rgbaGlow(glow: string, alpha: number): string {
  const m = glow.match(/rgba?\(([^)]+)\)/);
  if (!m) return glow;
  const [r, g, b] = m[1].split(",").map((s) => s.trim());
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FONT_DISPLAY = "var(--font-bebas), 'Saira Condensed', sans-serif";
const FONT_BOLD = "var(--font-din-bold), 'Saira Condensed', sans-serif";
const FONT_COND = "var(--font-din-cond), 'Saira Condensed', sans-serif";

function archetypeSize(label: string): number {
  const n = label.length;
  if (n <= 12) return 58;
  if (n <= 18) return 48;
  if (n <= 24) return 40;
  return 34;
}

const StoryFrame = forwardRef<HTMLDivElement, { card: Card }>(function StoryFrame(
  { card },
  ref,
) {
  const theme = resolveCardTheme(card);
  const accent = resolveResultTheme(card).ink;
  const archetype = card.archetype.toUpperCase();

  const cardTop = SAFE_TOP + 296;

  const abs = (top: number): CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    top,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "relative",
        width: STORY_W,
        height: STORY_H,
        overflow: "hidden",
        fontFamily: FONT_DISPLAY,
        background: `
          radial-gradient(72% 38% at 50% 6%, ${rgbaGlow(theme.glow, 0.36)}, transparent 72%),
          radial-gradient(120% 100% at 50% 42%, transparent 34%, rgba(0,0,0,0.72) 100%),
          #050505
        `,
      }}
    >
      {/* top — brand wordmark + concept line */}
      <div style={abs(SAFE_TOP + 8)}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 88,
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          YT<span style={{ color: BRAND }}>FUT</span>
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: FONT_COND,
            fontSize: 34,
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.86)",
            textTransform: "uppercase",
          }}
        >
          Your YouTube, Rated
        </div>
      </div>

      {/* centre */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: cardTop,
          transform: "translateX(-50%)",
          width: CARD_W,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-9%",
            borderRadius: "8%",
            background: "radial-gradient(closest-side, transparent 58%, rgba(0,0,0,0.62) 100%)",
            filter: "blur(22px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-3%",
            borderRadius: "8%",
            background: `radial-gradient(closest-side, transparent 60%, ${rgbaGlow(theme.glow, 0.85)} 86%, transparent 100%)`,
            filter: "blur(16px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            filter: `drop-shadow(0 30px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 1px rgba(255,255,255,0.25))`,
          }}
        >
          <PlayerCard card={card} />
        </div>
      </div>

      {/* archetype */}
      <div style={abs(cardTop + CARD_H + 36)}>
        <div
          style={{
            fontFamily: FONT_BOLD,
            fontSize: archetypeSize(archetype),
            fontWeight: 700,
            letterSpacing: "0.02em",
            lineHeight: 1,
            color: accent,
            textAlign: "center",
            whiteSpace: "nowrap",
            maxWidth: STORY_W - 120,
          }}
        >
          {archetype}
        </div>
      </div>

      {/* bottom — the CTA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: SAFE_BOTTOM + 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 56,
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: BRAND,
            display: "flex",
            alignItems: "center",
            gap: 18,
            whiteSpace: "nowrap",
          }}
        >
          TRY YOUR CARD ON YTFUT.VERCEL.APP
          <span style={{ fontSize: 48 }}>→</span>
        </div>
      </div>
    </div>
  );
});

export default StoryFrame;
