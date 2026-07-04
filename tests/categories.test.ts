import { describe, expect, it } from "vitest";
import { categoryLogoUrl, logoSlugForCategory, rankCategories, topCategoryLogo } from "@/lib/youtube/categories";

describe("rankCategories", () => {
  it("orders by category count, descending", () => {
    expect(rankCategories(["20", "28", "28", "28", "20"])).toEqual(["28", "20"]);
  });

  it("breaks count ties by name, ascending (deterministic)", () => {
    expect(rankCategories(["20", "28", "24"])).toEqual(["20", "24", "28"]);
  });

  it("returns an empty list when there are no categories", () => {
    expect(rankCategories([])).toEqual([]);
  });
});

describe("logoSlugForCategory", () => {
  it("maps categories to Icons8 slugs", () => {
    expect(logoSlugForCategory("20")).toBe("gamepad");
    expect(logoSlugForCategory("28")).toBe("cpu");
    expect(logoSlugForCategory("Gaming")).toBe("gamepad");
  });

  it("returns video fallback for unknown categories", () => {
    expect(logoSlugForCategory("9999")).toBe("video-camera");
  });
});

describe("topCategoryLogo", () => {
  it("returns the top category logo", () => {
    expect(topCategoryLogo(["20", "28"])).toEqual({ name: "Gaming", slug: "gamepad" });
    expect(topCategoryLogo(["28", "20"])).toEqual({ name: "Science & Technology", slug: "cpu" });
  });

  it("returns null for an empty list", () => {
    expect(topCategoryLogo([])).toBeNull();
  });
});

describe("categoryLogoUrl", () => {
  it("builds the Icons8 static PNG path", () => {
    expect(categoryLogoUrl("gamepad")).toBe(
      "https://img.icons8.com/ios-filled/100/ffffff/gamepad.png",
    );
  });
});
