import { describe, expect, it } from "vitest";
import { buildCard } from "@/lib/scoring/engine";
import type { Signals } from "@/lib/scoring/types";

const base: Signals = {
  login: "@pewdiepie",
  name: "PewDiePie",
  avatarUrl: "https://unavatar.io/youtube/pewdiepie",
  location: "JP",
  subscribers: 111000000,
  channel_age_years: 14.1,
  video_count: 4750,
  total_views: 29200000000,
  avg_views_recent: 1400000,
  category_count: 4,
  rankedCategories: ["20", "23", "24", "22"],
  topCategory: "20",
  recent_uploads: 12,
  active_years: 14,
  avg_likes_recent: 95000,
  avg_comments_recent: 9000,
  recent_spike: false,
};

const withLogin = (login: string): Signals => ({ ...base, login });

describe("buildCard — founder overrides", () => {
  it("forces younesfdj to a fixed overall above 89", () => {
    const card = buildCard(withLogin("younesfdj"));
    expect(card.overall).toBe(93);
    expect(card.overall).toBeGreaterThan(89);
  });

  it("forces mawsis to a fixed overall above 89", () => {
    const card = buildCard(withLogin("mawsis"));
    expect(card.overall).toBe(91);
    expect(card.overall).toBeGreaterThan(89);
  });

  it("gives founders the dedicated 'founder' tier (not auto-promoted to icon)", () => {
    expect(buildCard(withLogin("younesfdj")).finish).toBe("founder");
    expect(buildCard(withLogin("mawsis")).finish).toBe("founder");
  });

  it("attaches per-founder art + accent to the card", () => {
    const younes = buildCard(withLogin("younesfdj"));
    expect(younes.founder).toBeDefined();
    expect(younes.founder?.art).toContain("founder-red");
    expect(younes.founder?.accent).toBe("#ff2f45");

    const mawsis = buildCard(withLogin("mawsis"));
    expect(mawsis.founder?.art).toContain("founder-chrome");
    expect(mawsis.founder?.accent).toBe("#d8dde3");
  });

  it("matches founder logins case-insensitively", () => {
    expect(buildCard(withLogin("@YounesFDJ")).finish).toBe("founder");
    expect(buildCard(withLogin("@MAWSIS")).overall).toBe(91);
  });

  it("leaves non-founders untouched", () => {
    const card = buildCard(withLogin("@some-random-creator"));
    expect(card.finish).not.toBe("founder");
    expect(card.founder).toBeUndefined();
  });
});
