import { type YoutubeError } from "@/lib/youtube/client";
import { rateCard } from "@/lib/rating";
import { pickFlag } from "@/lib/flagPriority";
import { recordRating } from "@/lib/analytics";
import { after } from "next/server";
import type { Card } from "@/lib/scoring/types";

function resolveCountry(card: Card, override: string | null): Card {
  return { ...card, country: pickFlag(override, card.country) ?? "" };
}

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const override = new URL(req.url).searchParams.get("country");
  try {
    const card = await rateCard(username);
    after(() => recordRating());
    return Response.json(resolveCountry(card, override));
  } catch (e) {
    const err = e as YoutubeError;
    const status =
      err.type === "notfound"
        ? 404
        : err.type === "invalid"
          ? 400
          : err.type === "ratelimit"
            ? 429
            : err.type === "config"
              ? 500
              : 502;
    return Response.json({ error: err.message ?? "Failed to rate that profile." }, { status });
  }
}
