interface FrameConfig {
  name: string;
  description: string;
  image: string;
  buttons: {
    label: string;
    action: string;
  }[];
  postUrl: string;
  aspectRatio: string;
  input?: {
    text: string;
  };
}

export const frameConfig: FrameConfig = {
  name: "H3LP3R",
  description: "Help others and get help in return",
  image: `${process.env.NEXT_PUBLIC_HOST}/api/image?text=H3LP3R`,
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
