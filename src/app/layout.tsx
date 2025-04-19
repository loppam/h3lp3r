import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { frameConfig } from "./frame";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "H3LP3R",
  description: frameConfig.description,
  openGraph: {
    title: frameConfig.name,
    description: frameConfig.description,
    images: [frameConfig.image],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": frameConfig.image,
    "fc:frame:button:1": frameConfig.buttons[0].label,
    "fc:frame:button:2": frameConfig.buttons[1].label,
    "fc:frame:post_url": frameConfig.postUrl,
    ...(frameConfig.input?.text && {
      "fc:frame:input:text": frameConfig.input.text,
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
