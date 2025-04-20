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
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    if (!data?.result?.user) {
      throw new Error("No user data found");
    }

    const fid = data.result.user.fid;
    const pfpUrl =
      data.result.user.pfp?.url || `https://i.farcaster.xyz/profiles/${fid}`;

    // Verify the image exists
    const imageCheck = await fetch(pfpUrl);
    const finalPfpUrl = imageCheck.ok ? pfpUrl : "/images/default-avatar.png";

    return {
      fid,
      pfpUrl: finalPfpUrl,
      username: data.result.user.username,
      displayName: data.result.user.displayName,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      fid: null,
      pfpUrl: "/images/default-avatar.png",
      username: "unknown",
      displayName: "Unknown User",
    };
  }
}
