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
  it("leaves non-founders untouched", () => {
    const card = buildCard(withLogin("@some-random-creator"));
    expect(card.finish).not.toBe("founder");
    expect(card.founder).toBeUndefined();
  });

  it("clamps overall rating based on age and subscriber milestones", () => {
    // 1. Channel under 2 years / 500k subs -> clamped to 89
    const youngChannel = buildCard({
      ...base,
      login: "@youngchan",
      subscribers: 100000,
      channel_age_years: 1.5,
    });
    expect(youngChannel.overall).toBeLessThanOrEqual(89);

    // 2. Channel with 2 years / 500k subs -> capped at 90
    const twoYearChannel = buildCard({
      ...base,
      login: "@twoyear",
      subscribers: 500000,
      channel_age_years: 2.1,
    });
    expect(twoYearChannel.overall).toBeLessThanOrEqual(90);

    // 3. Channel with 3 years / 1M subs -> capped at 91
    const threeYearChannel = buildCard({
      ...base,
      login: "@threeyear",
      subscribers: 1000000,
      channel_age_years: 3.1,
    });
    expect(threeYearChannel.overall).toBeLessThanOrEqual(91);

    // 4. Channel with 4 years -> capped at 92
    const fourYearChannel = buildCard({
      ...base,
      login: "@fouryear",
      subscribers: 2000000,
      channel_age_years: 4.1,
    });
    expect(fourYearChannel.overall).toBeLessThanOrEqual(92);
  });
});
