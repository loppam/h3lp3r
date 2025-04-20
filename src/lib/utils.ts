import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
// const NEYNAR_WEBHOOK_URL =
//   "https://api.neynar.com/f/app/76b1a64a-624e-4b88-8571-673e7b74e9cb/event";

export async function getUserProfileData(identifier: string) {
  try {
    // Check if the identifier is a FID (numeric) or username
    const isFid = !isNaN(Number(identifier));
    const endpoint = isFid
      ? `https://api.neynar.com/v2/farcaster/user/bulk?fids=${identifier}`
      : `https://api.neynar.com/v2/farcaster/user/bulk?usernames=${identifier}`;

    const res = await fetch(endpoint, {
      headers: {
        api_key: NEYNAR_API_KEY || "",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.users?.[0]) {
      throw new Error("No user data found");
    }

    const user = data.users[0];
    const pfpUrl =
      user.pfp_url || `https://i.farcaster.xyz/profiles/${user.fid}`;

    // Verify the image exists
    const imageCheck = await fetch(pfpUrl);
    const finalPfpUrl = imageCheck.ok ? pfpUrl : "/images/default-avatar.png";

    return {
      fid: user.fid,
      pfpUrl: finalPfpUrl,
      username: user.username,
      displayName: user.display_name,
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

export async function getUserProfileByAddress(address: string) {
  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?addresses=${address}`,
      {
        headers: {
          api_key: NEYNAR_API_KEY || "",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.users?.[0]) {
      throw new Error("No user data found");
    }

    const user = data.users[0];
    const pfpUrl =
      user.pfp_url || `https://i.farcaster.xyz/profiles/${user.fid}`;

    // Verify the image exists
    const imageCheck = await fetch(pfpUrl);
    const finalPfpUrl = imageCheck.ok ? pfpUrl : "/images/default-avatar.png";

    return {
      fid: user.fid,
      pfpUrl: finalPfpUrl,
      username: user.username,
      displayName: user.display_name,
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
