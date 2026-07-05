import "server-only";
import { redis } from "./redis";

export interface VoteCounts {
  fair: number;
  buff: number;
  nerf: number;
  total: number;
}

// Base offset counts so it doesn't start at 0
const BASE_FAIR = 0;
const BASE_BUFF = 0;
const BASE_NERF = 0;

export async function getVotes(login: string): Promise<VoteCounts> {
  const key = `ytfut:votes:${login.toLowerCase()}`;
  if (!redis) {
    return {
      fair: BASE_FAIR,
      buff: BASE_BUFF,
      nerf: BASE_NERF,
      total: BASE_FAIR + BASE_BUFF + BASE_NERF,
    };
  }

  try {
    const raw = await redis.hgetall(key);
    const fair = parseInt(raw.fair || "0", 10) + BASE_FAIR;
    const buff = parseInt(raw.buff || "0", 10) + BASE_BUFF;
    const nerf = parseInt(raw.nerf || "0", 10) + BASE_NERF;
    return {
      fair,
      buff,
      nerf,
      total: fair + buff + nerf,
    };
  } catch (e) {
    console.error("[voting] failed to get votes:", (e as Error).message);
    return {
      fair: BASE_FAIR,
      buff: BASE_BUFF,
      nerf: BASE_NERF,
      total: BASE_FAIR + BASE_BUFF + BASE_NERF,
    };
  }
}

export async function castVote(login: string, type: "fair" | "buff" | "nerf"): Promise<VoteCounts> {
  const key = `ytfut:votes:${login.toLowerCase()}`;
  if (!redis) {
    const fair = BASE_FAIR + (type === "fair" ? 1 : 0);
    const buff = BASE_BUFF + (type === "buff" ? 1 : 0);
    const nerf = BASE_NERF + (type === "nerf" ? 1 : 0);
    return {
      fair,
      buff,
      nerf,
      total: fair + buff + nerf,
    };
  }

  try {
    await redis.hincrby(key, type, 1);
    return await getVotes(login);
  } catch (e) {
    console.error("[voting] failed to cast vote:", (e as Error).message);
    const fair = BASE_FAIR + (type === "fair" ? 1 : 0);
    const buff = BASE_BUFF + (type === "buff" ? 1 : 0);
    const nerf = BASE_NERF + (type === "nerf" ? 1 : 0);
    return {
      fair,
      buff,
      nerf,
      total: fair + buff + nerf,
    };
  }
}
