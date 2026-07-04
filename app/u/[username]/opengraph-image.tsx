import { ImageResponse } from "next/og";
import { after } from "next/server";
import { rateCard } from "@/lib/rating";
import { pickFlag } from "@/lib/flagPriority";
import { deEmDash } from "@/lib/text";
import { recordRating } from "@/lib/analytics";
import { loadCardAssets, cardTree } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";
import type { Card } from "@/lib/scoring/types";

export const runtime = "nodejs";
export const alt = "YTFut player card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIER_ACCENT: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c7d0",
  gold: "#e9cc74",
  totw: "#7fa8ff",
  toty: "#7fa8ff",
  icon: "#e9cc74",
  founder: "#ff2f45",
};

const CARD_W = 386;

const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" };

async function tryCard(username: string): Promise<Card | null> {
  try {
    return await rateCard(username);
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const raw = await tryCard(username);
  if (raw) after(() => recordRating());

  if (!raw) {
    const fonts = await loadCardFonts();
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f0f0f",
            backgroundImage: "radial-gradient(900px 500px at 50% -10%, rgba(255,0,0,0.16), transparent 60%)",
            color: "#f1f1f1",
            fontFamily: "DINPro",
            textAlign: "center",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", color: "#ff0000", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>YOUTUBE × WORLD CUP 26</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 20 }}>{username}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#aaaaaa", marginTop: 18 }}>Get your YouTube rated out of 99.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#ff0000", fontWeight: 700, marginTop: 26 }}>ytfut.com</div>
        </div>
      ),
      { ...size, fonts, headers: CACHE },
    );
  }

  const card = { ...raw, country: pickFlag(null, raw.country) ?? "" };
  const accent = card.founder?.accent ?? TIER_ACCENT[card.finish] ?? "#ff0000";
  const assets = await loadCardAssets(card, CARD_W);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#0f0f0f",
          backgroundImage:
            "radial-gradient(760px 520px at 22% 12%, rgba(255,0,0,0.14), transparent 60%), radial-gradient(720px 520px at 100% 110%, rgba(212,175,55,0.10), transparent 60%)",
          color: "#f1f1f1",
          fontFamily: "DINPro",
          padding: "0 76px",
        }}
      >
        <div style={{ display: "flex", marginRight: 64 }}>{cardTree(card, assets, CARD_W)}</div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", color: "#ff0000", fontSize: 24, fontWeight: 700, letterSpacing: 3 }}>YOUTUBE × WORLD CUP 26</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, marginTop: 14, lineHeight: 1 }}>{card.name}</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 34, fontWeight: 700 }}>
            <span style={{ display: "flex", color: accent }}>
              {card.overall} {card.finishLabel}
            </span>
            <span style={{ display: "flex", color: "#888888", margin: "0 14px" }}>·</span>
            <span style={{ display: "flex", color: "#aaaaaa" }}>{card.archetype}</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#aaaaaa", marginTop: 22, lineHeight: 1.3, maxWidth: 600 }}>
            {deEmDash(card.archetypeBlurb)}.
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#888888", marginTop: 32 }}>ytfut.com/{card.login}</div>
        </div>
      </div>
    ),
    { ...size, fonts: assets.fonts, headers: CACHE },
  );
}
