import { Metadata } from "next";
import App from "./app";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "H3LP3R - Decentralized Crowdfunding",
    description: "A decentralized crowdfunding platform on Farcaster",
    openGraph: {
      title: "H3LP3R - Decentralized Crowdfunding",
      description: "A decentralized crowdfunding platform on Farcaster",
      images: [
        {
          url: "https://h3lp3r.vercel.app/images/helper.png",
          width: 1200,
          height: 630,
          alt: "H3LP3R Logo",
        },
      ],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": "https://h3lp3r.vercel.app/images/helper.png",
      "fc:frame:button:1": "H3LP",
      "fc:frame:post_url": "https://h3lp3r.vercel.app/api/frames/launch",
      "fc:frame:input:text": "Enter H3LP code",
      "fc:frame:state": JSON.stringify({ counter: 0 }),
    },
    manifest: "/manifest.json",
  };
}

export default function Home() {
  return <App />;
}
