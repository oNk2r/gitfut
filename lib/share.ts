import type { Card } from "@/lib/scoring/types";

// Share service — a pure module that, given a card, produces the share text and
// per-platform intent URLs.

export type SharePlatform = "x" | "linkedin" | "whatsapp";

const SITE = "https://ytfut.vercel.app";

const lines = (c: Card): string[] => [
  `apparently i'm a ${c.overall}-rated ${c.position}. my videos do numbers, my cardio does not.`,
  `${c.finishLabel.toLowerCase()} finish, ${c.overall} overall. peaked, and it was on youtube.`,
  `pulled a ${c.overall} overall off my youtube. creator national team, where you at.`,
  `${c.overall} overall ${c.position}, ${c.archetype}. built different, uploaded different.`,
  `got carded at ${c.overall} overall. the network is calling.`,
  `turns out uploading videos makes you a ${c.overall}-rated baller. who knew.`,
];

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export function cardUrl(card: Card): string {
  const base = `${SITE}/${encodeURIComponent(card.login)}`;
  return card.country ? `${base}?country=${encodeURIComponent(card.country)}` : base;
}

export function shareText(card: Card): string {
  const pool = lines(card);
  return pool[hash(card.login) % pool.length];
}

export function shareMessage(card: Card): string {
  return `${shareText(card)}\n\nget rated →`;
}

export function intentUrl(platform: SharePlatform, card: Card): string {
  const url = cardUrl(card);
  const text = shareMessage(card);
  switch (platform) {
    case "x":
      return (
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(text) +
        "&url=" +
        encodeURIComponent(url) +
        "&hashtags=YTFut"
      );
    case "linkedin":
      return (
        "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(url)
      );
    case "whatsapp":
      return (
        "https://api.whatsapp.com/send?text=" +
        encodeURIComponent(`${text} ${url}`)
      );
  }
}

export function nativeSharePayload(card: Card): { title: string; text: string; url: string } {
  return {
    title: "YTFut",
    text: shareMessage(card),
    url: cardUrl(card),
  };
}

export function shareUrl(card: Card): string {
  return intentUrl("x", card);
}
