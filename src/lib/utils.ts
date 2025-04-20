import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getUserProfileData(username: string) {
  try {
    const res = await fetch(
      `https://api.warpcast.com/v2/user-by-username?username=${username}`
    );
    const data = await res.json();
    return {
      fid: data?.result?.user?.fid,
      pfpUrl:
        data?.result?.user?.pfp?.url ||
        `https://i.farcaster.xyz/profiles/${data?.result?.user?.fid}`,
      username: data?.result?.user?.username,
      displayName: data?.result?.user?.displayName,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
