import { FrameConfig } from "@farcaster/frame-sdk";

export const frameConfig: FrameConfig = {
  name: "H3LP3R",
  description: "Help others or get help through decentralized crowdfunding",
  image: "/api/frame/image",
  buttons: [
    {
      label: "H3LP",
      action: "post",
    },
    {
      label: "GET H3LP",
      action: "post",
    },
  ],
  postUrl: "/api/frame",
  aspectRatio: "1.91:1",
  input: {
    text: "Enter H3LP code (4 chars)",
  },
};
