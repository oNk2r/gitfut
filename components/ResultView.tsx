"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Card } from "@/lib/scoring/types";
import PlayerCard from "./PlayerCard";
import StoryFrame from "./StoryFrame";
import CardActions from "./CardActions";
import FlagPicker from "./FlagPicker";
import Mascot from "./Mascot";
import FooterCredit from "./FooterCredit";
import GithubStar from "./GithubStar";
import HowItWorksModal from "./HowItWorksModal";
import { AttributesPanel, MetricsPanel, ReportHeader } from "./RatingReport";
import { resolveResultTheme } from "./finishTheme";
import { useReveal } from "@/hooks/useReveal";
import { burstConfetti } from "@/lib/confetti";

interface Props {
  card: Card;
  onBack: () => void;
  onCountryChange: (code: string) => void;
  stars?: number | null;
  canonicalCountry?: string;
}

const CARD_WIDTH = "clamp(220px, min(80vw, 40vh), 332px)";

// Confetti palette per tier — gold for prestige, red always woven in (brand).
const CONFETTI: Record<string, string[]> = {
  toty: ["#e9cc74", "#d4af37", "#7fa8ff", "#ffffff", "#ff0000"],
  icon: ["#e9cc74", "#d4af37", "#f5f0e1", "#ffffff", "#ff0000"],
  totw: ["#ff0000", "#e9cc74", "#ffffff", "#7fa8ff"],
};

export default function ResultView({
  card,
  onBack,
  onCountryChange,
  stars,
  canonicalCountry = "",
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const theme = resolveResultTheme(card);
  const phase = useReveal(card.finish);
  const [modalOpen, setModalOpen] = useState(false);

  const [seenHome, setSeenHome] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ytfut:seen-home") === "1";
    } catch {}
    const t = setTimeout(() => setSeenHome(seen), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "burst") {
      const palette = card.founder
        ? [card.founder.accent, "#ffffff", "#ff0000"]
        : (CONFETTI[card.finish] ?? ["#ff0000", "#e9cc74", "#ffffff"]);
      burstConfetti(palette);
    }
  }, [phase, card.finish, card.founder]);

  const ignited = phase === "ignite" || phase === "burst" || phase === "freeze";

  return (
    <>
    <main className="relative z-[2] mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col px-[clamp(16px,4vw,22px)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 80% at 50% -10%, ${theme.glow}, transparent 55%), #0f0f0f`,
          opacity: ignited ? 0.9 : 0.4,
          transition: "opacity 1s ease",
        }}
      />

      <div className="mb-[8px] mt-[clamp(8px,2vh,18px)] flex w-full shrink-0 items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <button
            onClick={onBack}
            className={
              seenHome
                ? "group inline-flex items-center gap-[6px] text-[13px] font-medium tracking-wide text-ink-faint transition hover:text-ink"
                : "group inline-flex items-center gap-[6px] text-[13px] font-semibold tracking-wide text-brand transition hover:text-brand-hi"
            }
          >
            {seenHome ? (
              <>
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                BACK
              </>
            ) : (
              <>
                <ArrowLeft size={16} className="transition-transform group-hover:translate-x-0.5" />
                GET RATED
              </>
            )}
          </button>
          <Mascot size={40} kick={false} ball={false} animate={false} />
        </div>
        <div className="flex items-center gap-[clamp(10px,2vw,16px)] justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="cursor-pointer text-[12.5px] font-semibold text-ink-soft underline-offset-2 transition hover:text-brand hover:underline max-[420px]:hidden"
          >
            how it works ↗
          </button>
          <GithubStar stars={stars ?? null} />
        </div>
      </div>

      <div className="shrink-0">
        <ReportHeader card={card} />
      </div>

      <div className="mt-[clamp(14px,2.4vh,26px)] grid grid-cols-[1fr_auto_1fr] items-start gap-[clamp(16px,2.4vw,40px)] max-[980px]:mt-6 max-[980px]:flex max-[980px]:flex-col max-[980px]:items-center">
        <div className="flex justify-end max-[980px]:order-2 max-[980px]:w-full max-[980px]:max-w-[420px] max-[980px]:justify-center">
          <div className="w-full max-w-[360px]">
            <AttributesPanel card={card} />
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-[clamp(12px,2vh,18px)] max-[980px]:order-1">
          <div
            className="animate-spotlight pointer-events-none absolute left-1/2 top-[-10%] z-0 h-[70%] w-[120%] blur-[40px]"
            style={{
              background: `radial-gradient(60% 70% at 50% 0%, ${theme.glow}, transparent 72%)`,
              opacity: ignited ? 0.4 : 0,
              transition: "opacity .5s ease",
            }}
          />
          <div className="animate-walkout relative" style={{ width: CARD_WIDTH }}>
            <div ref={captureRef} className="relative">
              <div
                className="animate-glow pointer-events-none absolute -inset-[12%] z-0 rounded-full blur-[20px]"
                style={{
                  background: `radial-gradient(closest-side, ${theme.glow}, transparent 72%)`,
                  opacity: ignited ? 1 : 0,
                  transition: "opacity .6s ease",
                }}
              />
              <div className="relative z-[1]">
                <PlayerCard card={card} />
              </div>
            </div>
            <FlagPicker value={card.country} onChange={onCountryChange} />
          </div>
          <div style={{ width: CARD_WIDTH }}>
            <CardActions
              card={card}
              targetRef={captureRef}
              storyRef={storyRef}
              canonicalCountry={canonicalCountry}
            />
          </div>
        </div>

        <div className="flex max-[980px]:order-3 max-[980px]:w-full max-[980px]:max-w-[420px] max-[980px]:justify-center">
          <div className="w-full max-w-[360px]">
            <MetricsPanel card={card} />
          </div>
        </div>
      </div>

      <footer className="relative z-[2] mt-auto flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
        <FooterCredit />
      </footer>

      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          overflow: "hidden",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <StoryFrame ref={storyRef} card={card} />
      </div>
    </main>

    {modalOpen && <HowItWorksModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
