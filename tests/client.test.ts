import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchProfile } from "@/lib/youtube/client";

const mockChannelResponse = {
  items: [
    {
      snippet: {
        title: "MrBeast",
        customUrl: "@mrbeast",
        thumbnails: { high: { url: "https://example.com/avatar.jpg" } },
        country: "US",
        publishedAt: "2012-02-20T00:00:00Z",
      },
      statistics: {
        subscriberCount: "300000000",
        videoCount: "800",
        viewCount: "50000000000",
      },
      contentDetails: {
        relatedPlaylists: {
          uploads: "UU-mrbeast-uploads",
        },
      },
    },
  ],
};

const mockPlaylistResponse = {
  items: [
    { contentDetails: { videoId: "vid1" } },
    { contentDetails: { videoId: "vid2" } },
  ],
};

const mockVideosResponse = {
  items: [
    {
      id: "vid1",
      snippet: { categoryId: "24", publishedAt: "2026-01-01T00:00:00Z" },
      statistics: { viewCount: "100000000", likeCount: "5000000", commentCount: "150000" },
      contentDetails: { duration: "PT15M33S" },
    },
    {
      id: "vid2",
      snippet: { categoryId: "24", publishedAt: "2026-02-01T00:00:00Z" },
      statistics: { viewCount: "120000000", likeCount: "6000000", commentCount: "180000" },
      contentDetails: { duration: "PT45S" },
    },
  ],
};

let fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("YOUTUBE_API_KEY", "test-api-key");
  fetchMock = vi.fn(async (url: string) => {
    if (url.includes("channels")) {
      return new Response(JSON.stringify(mockChannelResponse), { status: 200 });
    }
    if (url.includes("playlistItems")) {
      return new Response(JSON.stringify(mockPlaylistResponse), { status: 200 });
    }
    if (url.includes("videos")) {
      return new Response(JSON.stringify(mockVideosResponse), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("YouTube Client fetchProfile", () => {
  it("successfully fetches channel profile and recent videos", async () => {
    const profile = await fetchProfile("mrbeast");
    expect(profile.login).toBe("@mrbeast");
    expect(profile.name).toBe("MrBeast");
    expect(profile.subscribers).toBe(300000000);
    expect(profile.recentVideos.length).toBe(2);
    expect(profile.recentVideos[0].views).toBe(100000000);
    expect(profile.recentVideos[0].durationSeconds).toBe(933); // PT15M33S = 933s
    expect(profile.recentVideos[1].durationSeconds).toBe(45); // PT45S = 45s
  });

  it("handles empty API key error", async () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");
    await expect(fetchProfile("mrbeast")).rejects.toMatchObject({ type: "config" });
  });

  it("handles channel not found", async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }));
    await expect(fetchProfile("nonexistent")).rejects.toMatchObject({ type: "notfound" });
  });
});
