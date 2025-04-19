"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the frame SDK
    sdk.actions.ready({
      disableNativeGestures: true,
      frameUrl: "https://h3lp3r.vercel.app",
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
