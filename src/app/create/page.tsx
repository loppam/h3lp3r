"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { createCampaign } from "@/lib/contracts";
import { ethers } from "ethers";
import { sdk, type Context } from "@farcaster/frame-sdk";
import Image from "next/image";
import { useDisconnect } from "wagmi";
import { config } from "@/lib/wagmi";
import { base } from "wagmi/chains";

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<Context.FrameContext>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        if (address) {
          const frameContext = await sdk.context;
          setContext(frameContext);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    load();
  }, [address]);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const handleCreateH3LP = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (!window.ethereum) {
        throw new Error("No Ethereum provider found");
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as ethers.providers.ExternalProvider
      );
      const signer = provider.getSigner();

      // Get current ETH price from CoinGecko
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const ethPrice = data.ethereum.usd || 2000; // Fallback to 2000 if API fails
      const ethAmount = parseFloat(goalAmount) / ethPrice;

      const h3lpAddress = await createCampaign(
        ethers.constants.AddressZero,
        ethers.utils.parseEther(ethAmount.toString()).toString(),
        signer
      );

      if (h3lpAddress) {
        setSuccess(`H3LP created successfully at ${h3lpAddress}`);
        setTitle("");
        setDescription("");
        setGoalAmount("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create H3LP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">H3LP3R</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => (window.location.href = "/create")}>
                H3LP
              </Button>
              {address && context?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <Image
                      src={context.user.pfpUrl || "/images/default-avatar.png"}
                      alt={`${context.user.username}'s profile`}
                      width={32}
                      height={32}
                      className="rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                    />
                    <span className="ml-2">{context.user.username}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <div className="font-medium text-gray-900">
                          {context.user.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{context.user.username}
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Create H3LP</CardTitle>
              <CardDescription>
                Start a new H3LP to get support from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter H3LP title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you need help with"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal Amount ($)</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="Enter goal amount in USD"
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && (
                  <div className="text-green-500 text-sm">{success}</div>
                )}
                <Button onClick={handleCreateH3LP} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create H3LP"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
