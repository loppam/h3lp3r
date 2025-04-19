import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function getUserNotificationDetailsKey(fid: number): string {
  return `frames-v2-demo:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  return await redis.get<FrameNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid));
}

export const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error("Error getting from KV:", error);
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await redis.set(key, value);
    } catch (error) {
      console.error("Error setting in KV:", error);
    }
  },

  delete: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Error deleting from KV:", error);
    }
  },
};
