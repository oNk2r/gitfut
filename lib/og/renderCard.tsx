import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Card, StatKey } from "@/lib/scoring/types";
import { resolveCardTheme } from "@/components/finishTheme";
import { categoryLogoUrl } from "@/lib/youtube/categories";
import { loadCardFonts } from "./card";

// Server-side re-creation of the in-app PlayerCard (components/PlayerCard.tsx),
// used both for the embeddable /<user>.png AND as the social unfurl (social preview).

const EMBED_W = 810;
const cardH = (w: number) => Math.round((w * 820) / 540);

const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");

const AVATAR_FALLBACK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const STAT_CELLS: { k: StatKey; l: string; vx: number; lx: number; vy: number; ly: number }[] = [
  { k: "pac", l: "PAC", vx: 21.3, lx: 32.41, vy: 64.63, ly: 65.24 },
  { k: "dri", l: "DRI", vx: 56.48, lx: 67.59, vy: 64.63, ly: 65.24 },
  { k: "sho", l: "SHO", vx: 21.3, lx: 32.41, vy: 72.2, ly: 72.8 },
  { k: "def", l: "DEF", vx: 56.48, lx: 67.59, vy: 72.2, ly: 72.8 },
  { k: "pas", l: "PAS", vx: 21.3, lx: 32.41, vy: 79.76, ly: 80.37 },
  { k: "phy", l: "PHY", vx: 56.48, lx: 67.59, vy: 79.76, ly: 80.37 },
];

const H_LINES: [number, number, number][] = [
  [19.44, 31.1, 10.19],
  [19.44, 40.85, 10.19],
  [16.67, 64.02, 66.67],
  [44.44, 89.63, 11.11],
];

const publicFile = (rel: string) => join(process.cwd(), "public", rel.replace(/^\//, ""));

async function fileDataUri(absPath: string, mime: string): Promise<string | null> {
  try {
    const buf = await readFile(absPath);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fetchBytes(url: string): Promise<{ buf: Buffer; mime: string } | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return { buf: Buffer.from(await res.arrayBuffer()), mime: res.headers.get("content-type")?.split(";")[0] || "image/png" };
  } catch {
    return null;
  }
}

async function fetchDataUri(url: string): Promise<string | null> {
  const r = await fetchBytes(url);
  return r ? `data:${r.mime};base64,${r.buf.toString("base64")}` : null;
}
async function avatarDataUri(url: string, bw: number, bh: number): Promise<string> {
  const r = await fetchBytes(url);
  if (!r || r.mime.includes("svg") || r.buf.toString("utf8").trim().startsWith("<svg")) {
    console.error("[renderCard] avatar fetch failed or returned SVG:", url);
    return AVATAR_FALLBACK;
  }
  try {
    const sharp = (await import("sharp")).default;
    const radialMask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><defs><radialGradient id="g" cx="52%" cy="41%" r="62%"><stop offset="50%" stop-color="#fff" stop-opacity="1"/><stop offset="84%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${bw}" height="${bh}" fill="url(#g)"/></svg>`,
    );
    const topMask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><defs><linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="1%" stop-color="#fff" stop-opacity="0"/><stop offset="22%" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="${bw}" height="${bh}" fill="url(#tf)"/></svg>`,
    );
    const out = await sharp(r.buf)
      .resize(bw, bh, { fit: "cover", position: "top" })
      .composite([
        { input: radialMask, blend: "dest-in" },
        { input: topMask, blend: "dest-in" },
      ])
      .png()
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch (e) {
    console.error("[renderCard] sharp feather failed:", (e as Error).message);
    return `data:${r.mime};base64,${r.buf.toString("base64")}`;
  }
}

export async function loadCardAssets(card: Card, w: number) {
  const avW = Math.round((w * 68) / 100);
  const avH = Math.round((w * 70) / 100);
  const bgRel = resolveCardTheme(card).bg.replace(/\.webp$/, ".png");
  const [fonts, bg, avatar, flag, logo] = await Promise.all([
    loadCardFonts(),
    fileDataUri(publicFile(bgRel), "image/png"),
    avatarDataUri(card.avatarUrl, avW, avH),
    card.country ? fileDataUri(publicFile(`/badges/flags/${card.country.toLowerCase()}.png`), "image/png") : Promise.resolve(null),
    card.categoryLogo ? fetchDataUri(categoryLogoUrl(card.categoryLogo.slug)) : Promise.resolve(null),
  ]);
  return { fonts, bg, avatar, flag, logo, avW, avH };
}

export type CardAssets = Awaited<ReturnType<typeof loadCardAssets>>;

export function cardTree(card: Card, assets: CardAssets, w: number) {
  const H = cardH(w);
  const cqw = (n: number) => (n / 100) * w;
  const at = (left: number, top: number) => ({ position: "absolute" as const, left: `${left}%`, top: `${top}%` });
  const t = resolveCardTheme(card);
  const ink = t.ink;
  const full = card.name.trim();
  const displayName = (full.length <= 9 ? full : full.split(" ").slice(-1)[0]).toUpperCase();
  const { bg, avatar, flag, logo, avW, avH } = assets;

  return (
    <div style={{ width: w, height: H, display: "flex", position: "relative", fontFamily: "DINPro" }}>
      {bg && <img alt="" src={bg} width={w} height={H} style={{ position: "absolute", left: 0, top: 0, width: w, height: H }} />}

      <img alt="" src={avatar} width={avW} height={avH} style={{ position: "absolute", left: cqw(27), top: cqw(13), width: avW, height: avH }} />

      {H_LINES.map(([l, top, ww], i) => (
        <div
          key={`h${i}`}
          style={{ ...at(l, top), width: `${ww}%`, height: cqw(0.3), backgroundColor: ink, opacity: 0.5, display: "flex" }}
        />
      ))}
      <div style={{ ...at(50, 66.46), width: cqw(0.3), height: "20.12%", backgroundColor: ink, opacity: 0.5, display: "flex" }} />

      <div style={{ ...at(16.3, 9.76), display: "flex", fontSize: cqw(22.2), fontWeight: 500, lineHeight: 1, color: ink }}>
        {pad2(card.overall)}
      </div>

      <div style={{ position: "absolute", left: 0, top: "23.78%", width: "50%", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", fontSize: cqw(9.3), fontWeight: 400, letterSpacing: cqw(0.19), color: ink }}>{card.position}</div>
      </div>

      {flag && <img alt="" src={flag} style={{ ...at(17.59, 33.17), width: "14.81%", height: "5.73%", objectFit: "contain" }} />}

      {logo && <img alt="" src={logo} style={{ ...at(19.06, 42.25), width: "11.875%", height: "7.5%", objectFit: "contain" }} />}

      <div style={{ position: "absolute", left: 0, top: "53.66%", width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", fontSize: cqw(13), fontWeight: 700, color: ink, whiteSpace: "nowrap" }}>{displayName}</div>
      </div>

      {STAT_CELLS.map((c) => (
        <div key={`v${c.k}`} style={{ ...at(c.vx, c.vy), display: "flex", fontSize: cqw(10.2), fontWeight: 700, color: ink }}>
          {pad2(card.stats[c.k])}
        </div>
      ))}
      {STAT_CELLS.map((c) => (
        <div
          key={`l${c.k}`}
          style={{ ...at(c.lx, c.ly), display: "flex", fontSize: cqw(9.3), fontWeight: 400, letterSpacing: cqw(0.19), color: ink }}
        >
          {c.l}
        </div>
      ))}

      <div style={{ ...at(8, 94.6), display: "flex", fontSize: cqw(4.1), fontWeight: 700, letterSpacing: cqw(0.4), color: ink, opacity: 0.62 }}>
        YTFUT.COM
      </div>
      <div style={{ position: "absolute", right: "8%", top: "94.6%", display: "flex", fontSize: cqw(4.1), fontWeight: 700, letterSpacing: cqw(0.4), color: ink, opacity: 0.62 }}>
        {card.login}
      </div>
    </div>
  );
}

export async function renderCardImage(card: Card): Promise<ImageResponse> {
  const assets = await loadCardAssets(card, EMBED_W);
  return new ImageResponse(cardTree(card, assets, EMBED_W), {
    width: EMBED_W,
    height: cardH(EMBED_W),
    fonts: assets.fonts,
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
