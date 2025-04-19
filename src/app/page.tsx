import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `https://h3lp3r.vercel.app/images/helper.png`,
  buttons: [
    {
      title: "Create Campaign",
      action: {
        type: "post",
        target: `https://h3lp3r.vercel.app/api/frames/create`,
      },
    },
    {
      title: "View Campaigns",
      action: {
        type: "post",
        target: `https://h3lp3r.vercel.app/api/frames/campaigns`,
      },
    },
  ],
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "H3LP3R - Decentralized Crowdfunding",
    openGraph: {
      title: "H3LP3R - Decentralized Crowdfunding",
      description: "A decentralized crowdfunding platform on Farcaster",
      images: [
        {
          url: `https://h3lp3r.vercel.app/images/helper.png`,
          width: 1200,
          height: 630,
          alt: "H3LP3R Logo",
        },
      ],
    },
    icons: {
      icon: `https://h3lp3r.vercel.app/images/logo.png`,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
