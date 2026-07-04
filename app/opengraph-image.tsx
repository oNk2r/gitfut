import { ImageResponse } from "next/og";
import { SAMPLE_CARDS } from "@/lib/youtube/samples";
import { loadCardAssets, cardTree } from "@/lib/og/renderCard";

// Branded preview for the home page.
export const runtime = "nodejs";
export const alt = "YTFut — your YouTube, rated out of 99";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CARD_W = 316;

export default async function Image() {
  const card = SAMPLE_CARDS.find((c) => c.login === "@mrbeast") ?? SAMPLE_CARDS[0];
  const assets = await loadCardAssets(card, CARD_W);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f0f0f",
          backgroundImage:
            "radial-gradient(900px 520px at 22% -12%, rgba(255,0,0,0.20), transparent 60%), radial-gradient(720px 520px at 105% 120%, rgba(212,175,55,0.14), transparent 60%)",
          color: "#f1f1f1",
          fontFamily: "DINPro",
          padding: 72,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", paddingRight: 48 }}>
          <div style={{ display: "flex", color: "#ff0000", fontSize: 24, fontWeight: 700, letterSpacing: 3 }}>
            YOUTUBE × WORLD CUP 26
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ display: "flex", fontSize: 108, fontWeight: 800, lineHeight: 0.95 }}>GET</div>
            <div style={{ display: "flex", fontSize: 108, fontWeight: 800, lineHeight: 0.95 }}>
              <span>RATED</span>
              <span style={{ color: "#ff0000" }}>.</span>
            </div>
            <div style={{ display: "flex", fontSize: 34, color: "#aaaaaa", marginTop: 26, maxWidth: 600, lineHeight: 1.3 }}>
              Turn any YouTube channel into a World-Cup-style player card, rated out of 99.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#888888" }}>ytfut.com</div>
        </div>

        <div style={{ display: "flex" }}>{cardTree(card, assets, CARD_W)}</div>
      </div>
    ),
    { ...size, fonts: assets.fonts },
  );
}
