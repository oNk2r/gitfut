import "server-only";
import { redis } from "./redis";
import { buildCard } from "./scoring/engine";
import { fetchProfile } from "./youtube/client";
import { signalsFromPayload } from "./youtube/signals";
import { SAMPLE_CARDS } from "./youtube/samples";
import type { Card } from "./scoring/types";

const CACHE_VERSION = "v1";
const CARD_TTL_SECONDS = 120 * 60; // 2h

const normalizeLogin = (username: string) => {
  const cleaned = username.trim().toLowerCase();
  // Ensure we keep the @ prefix if present, but standardise handle lookup
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
};

const keyFor = (login: string) => `ytfut:card:${CACHE_VERSION}:${login}`;

async function readCache(login: string): Promise<Card | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(keyFor(login));
    return raw ? (JSON.parse(raw) as Card) : null;
  } catch (e) {
    console.error("[rating] cache read failed:", (e as Error).message);
    return null;
  }
}

async function writeCache(login: string, card: Card): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(keyFor(login), JSON.stringify(card), "EX", CARD_TTL_SECONDS);
  } catch (e) {
    console.error("[rating] cache write failed:", (e as Error).message);
  }
}

const inflight = new Map<string, Promise<Card>>();

async function buildFresh(username: string, login: string): Promise<Card> {
  const payload = await fetchProfile(username);
  const card = buildCard(signalsFromPayload(payload));
  await writeCache(login, card);
  return card;
}

export async function rateCard(username: string): Promise<Card> {
  const login = normalizeLogin(username);

  // Tokenless demo: fallback to in-memory YouTube creator samples
  if (!process.env.YOUTUBE_API_KEY) {
    const sample = SAMPLE_CARDS.find((c) => c.login.toLowerCase() === login);
    if (sample) return sample;
  }

  const cached = await readCache(login);
  if (cached) return cached;

  const existing = inflight.get(login);
  if (existing) return existing;

  const pending = buildFresh(username, login).finally(() => inflight.delete(login));
  inflight.set(login, pending);
  return pending;
}
