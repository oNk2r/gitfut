import { cache } from "react";
import { after } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import Background from "@/components/Background";
import { type YoutubeError } from "@/lib/youtube/client";
import { rateCard } from "@/lib/rating";
import { getRepoStars } from "@/lib/github/stars";
import { pickFlag } from "@/lib/flagPriority";
import { recordRating } from "@/lib/analytics";
import type { Card } from "@/lib/scoring/types";
import RatingRoute from "./RatingRoute";

export const dynamic = "force-dynamic";

const loadCard = cache(
  async (username: string): Promise<{ card: Card } | { error: YoutubeError }> => {
    try {
      return { card: await rateCard(username) };
    } catch (e) {
      return { error: e as YoutubeError };
    }
  },
);

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const res = await loadCard(username);
  if ("card" in res) {
    return {
      title: `${res.card.name} — ${res.card.overall} ${res.card.finishLabel} · YTFut`,
      description: `${res.card.name} rated on YTFut: ${res.card.overall} OVR ${res.card.position}, ${res.card.archetype}.`,
      alternates: { canonical: `/${res.card.login}` },
      twitter: { card: "summary_large_image" },
    };
  }
  return { title: `@${username} · YTFut`, robots: { index: false } };
}

function NotRated({ username, error }: { username: string; error: YoutubeError }) {
  const rateLimited = error.type === "ratelimit";
  const heading = rateLimited ? "The raters are gassed" : "No file found";
  const message = rateLimited
    ? `You lot went viral and stormed the training ground all at once — YouTube just showed us a yellow card for time-wasting. Give the raters a couple minutes to catch their breath, then send @${username} back on.`
    : error.type === "notfound"
      ? `There's no YouTube channel named @${username}.`
      : error.type === "invalid"
        ? `“${username}” isn't a valid YouTube handle.`
        : error.message;
  return (
    <main className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 text-center">
      <div className="font-display text-[12px] font-bold tracking-[.3em] text-brand">RATING REPORT</div>
      <h1 className="font-display mt-3 text-[clamp(30px,6vw,48px)] font-black leading-[.95]">{heading}</h1>
      <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">{message}</p>
      <Link
        href="/"
        className="font-display mt-7 inline-flex h-[46px] items-center rounded-xl bg-brand px-6 text-[16px] tracking-[.06em] text-[#ffffff] transition hover:bg-brand-hi"
      >
        {rateLimited ? "BACK TO THE BENCH" : "RATE SOMEONE ELSE"}
      </Link>
    </main>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { username } = await params;
  const { country: override } = await searchParams;
  const [res, stars] = await Promise.all([loadCard(username), getRepoStars()]);
  
  let card: Card | null = "card" in res ? res.card : null;
  let canonicalCountry = "";
  if (card) {
    after(() => recordRating());
    canonicalCountry = pickFlag(null, card.country) ?? "";
    const displayCountry = pickFlag(override, card.country) ?? "";
    card = { ...card, country: displayCountry };
  }
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      {card ? (
        <RatingRoute card={card} stars={stars} canonicalCountry={canonicalCountry} />
      ) : (
        <NotRated username={username} error={(res as { error: YoutubeError }).error} />
      )}
    </div>
  );
}
