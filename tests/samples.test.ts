import { describe, expect, it } from "vitest";
import { SAMPLE_CARDS } from "@/lib/youtube/samples";

describe("showcase samples", () => {
  const by = Object.fromEntries(SAMPLE_CARDS.map((c) => [c.login, c]));

  it("pin origin countries", () => {
    expect(by["@mrbeast"].country).toBe("US");
    expect(by["@pewdiepie"].country).toBe("JP");
    expect(by["@mkbhd"].country).toBe("US");
    expect(by["@theprimeagen"].country).toBe("US");
  });

  it("category logo matches the top category, never a mismatch", () => {
    expect(by["@pewdiepie"].topCategory).toBe("20");
    expect(by["@pewdiepie"].categoryLogo).toEqual({ name: "Gaming", slug: "gamepad" });
    expect(by["@mkbhd"].categoryLogo).toEqual({ name: "Science & Technology", slug: "cpu" });
  });
});
