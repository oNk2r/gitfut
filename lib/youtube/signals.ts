import type { RawPayload } from "./client";
import { rankCategories } from "./categories";
import type { Signals } from "@/lib/scoring/types";

const YEAR_MS = 31557600000;
const DAY_MS = 86400000;

export function signalsFromPayload(p: RawPayload, now = Date.now()): Signals {
  const channel_age_years = Math.max(0.1, (now - Date.parse(p.createdAt)) / YEAR_MS);
  const active_years = Math.max(1, Math.round(channel_age_years));

  // Extract category IDs
  const cats = p.recentVideos.map((v) => v.categoryId).filter(Boolean);
  const category_count = new Set(cats).size;
  const rankedCategories = rankCategories(cats);
  const topCategory = rankedCategories[0] ?? "22"; // default to People & Blogs

  // Count recent uploads in the last 365 days
  const uploadsLastYear = p.recentVideos.filter((v) => {
    const ageMs = now - Date.parse(v.publishedAt);
    return ageMs <= YEAR_MS;
  }).length;

  const totalRecentViews = p.recentVideos.reduce((sum, v) => sum + v.views, 0);
  const totalRecentLikes = p.recentVideos.reduce((sum, v) => sum + v.likes, 0);
  const totalRecentComments = p.recentVideos.reduce((sum, v) => sum + v.comments, 0);
  const countRecent = p.recentVideos.length || 1;

  const avg_views_recent = Math.round(totalRecentViews / countRecent);
  const avg_likes_recent = Math.round(totalRecentLikes / countRecent);
  const avg_comments_recent = Math.round(totalRecentComments / countRecent);

  // Historical view baseline
  const historicalAvgViews = p.videoCount > 0 ? p.viewCount / p.videoCount : 0;
  
  // Calculate spike: if recent views are significantly higher than the channel's historical baseline
  // We look at the top 3 highest views in recent videos to see if they spike
  const sortedViews = [...p.recentVideos].map((v) => v.views).sort((a, b) => b - a);
  const top3Avg = sortedViews.slice(0, 3).reduce((s, x) => s + x, 0) / Math.min(sortedViews.length || 1, 3);
  const recent_spike = historicalAvgViews > 0 && top3Avg > 2.5 * historicalAvgViews;

  return {
    login: p.login,
    name: p.name || p.login,
    avatarUrl: p.avatarUrl,
    location: p.location,
    subscribers: p.subscribers,
    channel_age_years,
    video_count: p.videoCount,
    total_views: p.viewCount,
    avg_views_recent,
    category_count,
    rankedCategories,
    topCategory,
    recent_uploads: uploadsLastYear,
    active_years,
    avg_likes_recent,
    avg_comments_recent,
    recent_spike,
  };
}
