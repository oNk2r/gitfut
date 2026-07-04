import type { MetadataRoute } from "next";
import { SAMPLE_LOGINS } from "@/lib/youtube/samples";

const BASE = "https://ytfut.com";

// Home + the showcase profiles (real, indexable example cards).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    ...SAMPLE_LOGINS.map((login) => ({
      url: `${BASE}/${encodeURIComponent(login)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
