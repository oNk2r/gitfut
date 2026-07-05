"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { Check, Copy, Download, ImageDown, Link2, Share2 } from "lucide-react";
import type { Card } from "@/lib/scoring/types";
import { cardUrl, intentUrl, nativeSharePayload } from "@/lib/share";
import { renderCardImage } from "@/lib/capture";
import { resolveResultTheme } from "./finishTheme";

const RENDER_OPTS = { pixelRatio: 3, cacheBust: true } as const;
const STORY_RENDER_OPTS = { pixelRatio: 1, cacheBust: true } as const;

function XLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

interface ExportAction {
  id: string;
  label: string;
  title: string;
  done: string;
  icon: typeof Download;
  run: (node: HTMLElement, card: Card) => Promise<void>;
}

const EXPORTS: ExportAction[] = [
  {
    id: "download",
    label: "Download",
    title: "Download as PNG",
    done: "Saved",
    icon: Download,
    run: async (node, card) => {
      const url = await renderCardImage(node, (n) => toPng(n, RENDER_OPTS));
      const a = document.createElement("a");
      a.download = `${card.login}-ytfut.png`;
      a.href = url;
      a.click();
    },
  },
  {
    id: "copy",
    label: "Copy image",
    title: "Copy image to clipboard",
    done: "Copied",
    icon: Copy,
    run: async (node) => {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": renderCardImage(
            node,
            async (n) => {
              const blob = await toBlob(n, RENDER_OPTS);
              if (!blob) throw new Error("render returned no image");
              return blob;
            },
            { transparent: true },
          ),
        }),
      ]);
    },
  },
];

const PLATFORM_BTN =
  "group flex items-center justify-center gap-[7px] rounded-xl border border-line bg-white/[0.03] py-[11px] text-[12.5px] font-semibold text-ink-soft transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[var(--pb)]/[0.12] hover:text-white active:translate-y-0 active:scale-[.98]";

const brandHover = (brand: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = `${brand}66`;
    e.currentTarget.style.boxShadow = `0 6px 18px -8px ${brand}80`;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.boxShadow = "";
  },
});

export default function CardActions({
  card,
  targetRef,
  storyRef,
  canonicalCountry = "",
}: {
  card: Card;
  targetRef: React.RefObject<HTMLDivElement | null>;
  storyRef?: React.RefObject<HTMLDivElement | null>;
  canonicalCountry?: string;
}) {
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(true);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supported = typeof navigator !== "undefined" && typeof navigator.share === "function";
    if (supported) return;
    const t = setTimeout(() => setCanNativeShare(false), 0);
    return () => clearTimeout(t);
  }, []);

  const tier = resolveResultTheme(card).ink;

  const shareCard =
    card.country && card.country !== canonicalCountry ? card : { ...card, country: "" };

  const runExport = async (a: ExportAction) => {
    const node = targetRef.current;
    if (!node || busy) return;
    setBusy(a.id);
    setError(null);
    try {
      await a.run(node, card);
      setDone(a.id);
      setTimeout(() => setDone((d) => (d === a.id ? null : d)), 1500);
    } catch (e) {
      console.error("[ytfut] card export failed:", e);
      setError(`${a.label} failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const nativeShare = async () => {
    const node = targetRef.current;
    const payload = nativeSharePayload(shareCard);
    try {
      if (node && "canShare" in navigator) {
        const blob = await renderCardImage(node, (n) => toBlob(n, RENDER_OPTS));
        if (blob) {
          const file = new File([blob], `${card.login}-ytfut.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ ...payload, files: [file] });
            return;
          }
        }
      }
      await navigator.share(payload);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      window.open(intentUrl("x", shareCard), "_blank", "noopener,noreferrer");
    }
  };

  const shareStory = async () => {
    const node = storyRef?.current;
    if (!node || busy) return;
    setBusy("story");
    setError(null);
    try {
      const blob = await renderCardImage(node, async (n) => {
        const b = await toBlob(n, STORY_RENDER_OPTS);
        if (!b) throw new Error("render returned no image");
        return b;
      });
      const file = new File([blob], `${card.login}-ytfut-story.png`, { type: "image/png" });

      const isMobile =
        typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
      let shared = false;
      if (
        isMobile &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ ...nativeSharePayload(shareCard), files: [file] });
          shared = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            shared = true;
          }
        }
      }

      if (!shared) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = file.name;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }

      setDone("story");
      setTimeout(() => setDone((d) => (d === "story" ? null : d)), 1500);
    } catch (e) {
      console.error("[ytfut] story export failed:", e);
      setError(`Story failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl(shareCard));
      setLinkCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex w-full flex-col gap-[10px]">
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className="font-display group relative flex h-[50px] w-full items-center justify-center gap-[9px] overflow-hidden rounded-xl bg-gradient-to-b from-brand to-brand-mid text-[18px] tracking-[.05em] text-[#ffffff] shadow-[0_0_0_1px_rgba(255,0,0,.45),0_10px_28px_-6px_rgba(255,0,0,.5)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_0_0_1px_rgba(255,77,77,.6),0_14px_34px_-6px_rgba(255,0,0,.62)] active:translate-y-0 active:scale-[.985] active:duration-75"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <Share2 size={18} strokeWidth={2.5} className="relative" />
          <span className="relative">SHARE MY CARD</span>
        </button>
      )}

      <div className="grid w-full grid-cols-2 gap-[8px]">
        <button
          type="button"
          onClick={() => window.open(intentUrl("x", shareCard), "_blank", "noopener,noreferrer")}
          title="Share on X"
          aria-label="Share on X"
          className="group flex items-center justify-center gap-[8px] rounded-xl border border-line bg-white/[0.03] py-[12px] text-[13.5px] font-semibold text-ink-soft transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-white/[0.08] hover:text-white active:translate-y-0 active:scale-[.98]"
          style={{ "--pb": "#ffffff" } as React.CSSProperties}
          {...brandHover("#ffffff")}
        >
          <XLogo size={15} />
          <span>Share on X</span>
        </button>

        {(() => {
          const dl = EXPORTS.find((a) => a.id === "download")!;
          const dlDone = done === dl.id;
          const dlBusy = busy === dl.id;
          const DlIcon = dl.icon;
          return (
            <button
              onClick={() => runExport(dl)}
              disabled={dlBusy}
              title="Download card as PNG"
              aria-label="Download card as PNG"
              className="group relative flex items-center justify-center gap-[8px] overflow-hidden rounded-xl border py-[12px] text-[13.5px] font-bold tracking-[.02em] transition-all duration-200 ease-out hover:-translate-y-[1px] active:translate-y-0 active:scale-[.98] disabled:opacity-70"
              style={{ color: tier, borderColor: `${tier}66`, background: `${tier}1f` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${tier}b3`;
                e.currentTarget.style.background = `${tier}33`;
                e.currentTarget.style.boxShadow = `0 10px 26px -8px ${tier}8c`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${tier}66`;
                e.currentTarget.style.background = `${tier}1f`;
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {dlBusy ? (
                <span
                  className="h-[15px] w-[15px] animate-spin rounded-full border-[1.5px]"
                  style={{ borderColor: `${tier}40`, borderTopColor: tier }}
                />
              ) : dlDone ? (
                <Check size={16} strokeWidth={2.6} />
              ) : (
                <DlIcon size={16} strokeWidth={2.4} className="transition-transform group-hover:translate-y-[1px]" />
              )}
              {dlBusy ? "Saving…" : dlDone ? "Saved" : "Download"}
            </button>
          );
        })()}
      </div>

      {error && <p className="text-center text-[12px] leading-snug text-[#ff9d96]">{error}</p>}
    </div>
  );
}
