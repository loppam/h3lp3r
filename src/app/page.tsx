import { Metadata } from "next";
import App from "./app";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const title = "H3LP3R - Decentralized Crowdfunding";
  const description =
    "Enter a H3LP code to find and support campaigns on Farcaster";
  const images = "https://h3lp3r.vercel.app/images/helper.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: images,
          width: 1200,
          height: 630,
          alt: "H3LP3R Logo",
        },
      ],
    },
    other: {
      // Frame metadata
      "fc:frame": "vNext",
      "fc:frame:image": images,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": "H3LP",
      "fc:frame:button:1:action": "post",
      "fc:frame:button:2": "GET H3LP",
      "fc:frame:button:2:action": "link",
      "fc:frame:button:2:target_base_url": "https://h3lp3r.vercel.app",
      "fc:frame:post_url": "https://h3lp3r.vercel.app/api/frames/launch",
      "fc:frame:input:text": "Enter H3LP code (optional)",
      // Mini App metadata
      "of:accepts:xmtp": "true",
      "of:brand_color": "#dfdfdf",
      "of:name": "H3LP3R",
      "of:description": description,
      "of:image": images,
      "of:version": "vNext",
    },
    manifest: "/manifest.json",
  };
}

export default function Home() {
  return <App>{null}</App>;
}
