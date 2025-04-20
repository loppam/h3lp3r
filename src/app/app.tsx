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
import { getUserProfileByAddress } from "@/lib/utils";
const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
        // Initialize app
        if (address) {
          const profile = await getUserProfileByAddress(address);
          if (profile) {
            setUserProfile({
              pfpUrl: profile.pfpUrl,
              username: profile.username,
              displayName: profile.displayName,
            });
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
      }
    };
    load();
  }, [address]);

  const handleSearch = async () => {
    // If input is 4 characters, try to find campaign by code
    if (searchInput.length === 4) {
      try {
        const campaign = await getCampaignByCode(searchInput.toUpperCase());
        if (campaign) {
          window.location.href = `/campaign/${campaign.address}`;
          return;
        }
      } catch (error) {
        console.error("Error searching for campaign:", error);
      }
    }
    // Otherwise, use it as a search query for the campaign list
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Image
                    src={userProfile.pfpUrl}
                    alt={`${userProfile.displayName}'s profile`}
                    width={32}
                    height={32}
                    className="rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                  />
                  <span className="ml-2">{userProfile.displayName}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <div className="font-medium text-gray-900">
                        {userProfile.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{userProfile.username}
                      </div>
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {!isConnected ? (
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
                  GET H3LP
                </Button>
              </div>

              <div className="flex gap-4">
                <Input
                  placeholder="Search H3LPs or enter code (4 chars)"
                  className="flex-1"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                  maxLength={searchInput.length === 4 ? 4 : undefined}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              <span>{NEYNAR_API_KEY}</span>
              <CampaignList searchQuery={searchInput} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
