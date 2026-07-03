import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Pins the request-timeout backstop: a GitHub socket that never responds must be
// aborted and surface as a network error, not hang the scout forever.
vi.mock("server-only", () => ({}));

import { fetchProfile } from "@/lib/github/client";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("GITHUB_TOKEN", "test-token");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fetchProfile request timeout", () => {
  it("aborts a hung request and fails as a network error", async () => {
    // fetch that never resolves on its own, but rejects (like the real one) when
    // its AbortSignal fires — so only our timeout can end it.
    const fetchMock = vi.fn(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = fetchProfile("torvalds");
    const assertion = expect(result).rejects.toMatchObject({ type: "network" });

    // First attempt aborts at the timeout, one retry after the backoff delay,
    // then the second attempt aborts too -> terminal network failure.
    await vi.advanceTimersByTimeAsync(12_000);
    await vi.advanceTimersByTimeAsync(250);
    await vi.advanceTimersByTimeAsync(12_000);

    await assertion;
    // profile query only: 2 attempts (initial + 1 retry). It never reaches the
    // lifetime fetch because the profile request itself fails.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
