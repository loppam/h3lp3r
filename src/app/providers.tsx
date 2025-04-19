"use client";

import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [farcasterFrame()],
});

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide splash screen when app is ready
    sdk.actions.ready();

    // Disable native gestures if needed
    // sdk.actions.ready({ disableNativeGestures: true });
  }, []);

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
