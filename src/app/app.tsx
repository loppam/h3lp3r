"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CampaignList } from "@/components/CampaignList";
import { getCampaignByCode } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { base } from "wagmi/chains";
import { sdk } from "@farcaster/frame-sdk";
import { getUserProfileData } from "@/lib/utils";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [isFrame, setIsFrame] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    pfpUrl: string;
    username: string;
    displayName: string;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (address) {
        // In a real app, you would have a way to get the Farcaster username from the address
        // For now, we'll use a placeholder
        const profile = await getUserProfileData("dwr"); // Replace with actual username lookup
        if (profile) {
          setUserProfile({
            pfpUrl: profile.pfpUrl,
            username: profile.username,
            displayName: profile.displayName,
          });
        }
      }
    };
    fetchProfile();
  }, [address]);

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
            {address && userProfile && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <Image
                    src={userProfile.pfpUrl}
                    alt={`${userProfile.displayName}'s profile`}
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    {shouldShowConnectButton && (
                      <button
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
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
