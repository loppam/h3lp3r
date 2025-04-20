"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CampaignList } from "@/components/CampaignList";
import { getCampaignByCode } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { base } from "wagmi/chains";
import { sdk } from "@farcaster/frame-sdk";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [isFrame, setIsFrame] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        setIsFrame(!!context?.client);
        sdk.actions.ready();
      } catch (error) {
        console.error("Error checking frame context:", error);
      }
    };
    load();
  }, []);

  const handleSearchByCode = async () => {
    if (searchCode.length !== 4) {
      alert("Please enter a valid 4-character code");
      return;
    }
    try {
      const campaign = await getCampaignByCode(searchCode);
      if (campaign) {
        window.location.href = `/campaign/${campaign.address}`;
      } else {
        alert("No H3LP found with this code");
      }
    } catch {
      alert("Error searching for H3LP");
    }
  };

  // If we're in a frame, we should already be connected
  const shouldShowConnectButton = !isFrame;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">H3LP3R</h1>
            {address && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Image
                    src={`https://warpcast.com/${address}.png`}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="text-sm text-gray-600">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                {shouldShowConnectButton && (
                  <Button variant="outline" onClick={() => disconnect()}>
                    Disconnect
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {!isConnected && shouldShowConnectButton ? (
            <div className="flex justify-center">
              <Button
                onClick={() =>
                  connect({
                    chainId: base.id,
                    connector: config.connectors[0],
                  })
                }
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-end">
                <Button onClick={() => (window.location.href = "/create")}>
                  Create H3LP
                </Button>
              </div>

              <div className="flex gap-4">
                <Input
                  placeholder="Search H3LPs..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter H3LP code (4 chars)"
                    className="w-40"
                    value={searchCode}
                    onChange={(e) =>
                      setSearchCode(e.target.value.toUpperCase())
                    }
                    maxLength={4}
                  />
                  <Button onClick={handleSearchByCode}>Search</Button>
                </div>
              </div>

              <CampaignList searchQuery={searchQuery} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
