import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const fetchProfile = vi.fn();
vi.mock("@/lib/youtube/client", () => ({ fetchProfile: (u: string) => fetchProfile(u) }));
vi.mock("@/lib/youtube/signals", () => ({ signalsFromPayload: (p: unknown) => p }));
vi.mock("@/lib/scoring/engine", () => ({ buildCard: (s: unknown) => s }));

const store = new Map<string, string>();
vi.mock("@/lib/redis", () => ({
  redis: {
    get: async (k: string) => store.get(k) ?? null,
    set: async (k: string, v: string) => {
      store.set(k, v);
    },
  },
}));

import { rateCard } from "@/lib/rating";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
const payload = (login: string) => ({ login: login.startsWith("@") ? login.toLowerCase() : `@${login.toLowerCase()}`, name: login });

beforeEach(() => {
  store.clear();
  fetchProfile.mockReset();
  vi.stubEnv("YOUTUBE_API_KEY", "test-token");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("rateCard single-flight", () => {
  it("collapses concurrent misses for the same login into one fetch", async () => {
    const d = deferred<ReturnType<typeof payload>>();
    fetchProfile.mockReturnValueOnce(d.promise);

    const calls = Promise.all([rateCard("MrBeast"), rateCard("mrbeast"), rateCard("MRBEAST")]);
    await flush();
    expect(fetchProfile).toHaveBeenCalledTimes(1);

    const p = payload("@mrbeast");
    d.resolve(p);
    const [a, b, c] = await calls;
    expect(a).toEqual(p);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(fetchProfile).toHaveBeenCalledTimes(1);
  });

  it("fetches separately for different logins", async () => {
    fetchProfile.mockImplementation(async (u: string) => payload(u));
    await Promise.all([rateCard("mrbeast"), rateCard("mkbhd")]);
    expect(fetchProfile).toHaveBeenCalledTimes(2);
  });

  it("does not memoise failures — the next rate retries", async () => {
    fetchProfile.mockRejectedValueOnce({ type: "ratelimit", message: "limited" });
    await expect(rateCard("mrbeast")).rejects.toMatchObject({ type: "ratelimit" });
    expect(fetchProfile).toHaveBeenCalledTimes(1);

    fetchProfile.mockResolvedValueOnce(payload("@mrbeast"));
    await expect(rateCard("mrbeast")).resolves.toMatchObject({ login: "@mrbeast" });
    expect(fetchProfile).toHaveBeenCalledTimes(2);
  });

  it("serves a cached card without refetching", async () => {
    fetchProfile.mockResolvedValueOnce(payload("@mrbeast"));
    await rateCard("mrbeast");
    await rateCard("mrbeast");
    await rateCard("mrbeast");
    expect(fetchProfile).toHaveBeenCalledTimes(1);
  });

  it("refetches once the in-flight build has settled (window closed)", async () => {
    fetchProfile.mockResolvedValueOnce(payload("@mrbeast"));
    await rateCard("mrbeast");
    store.clear();
    fetchProfile.mockResolvedValueOnce(payload("@mrbeast"));
    await rateCard("mrbeast");
    expect(fetchProfile).toHaveBeenCalledTimes(2);
  });
});
