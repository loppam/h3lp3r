"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
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
import { useState, useEffect } from "react";
import { createCampaign, getCampaignByCode } from "@/lib/contracts";
import { ethers } from "ethers";
import { CampaignList } from "@/components/CampaignList";
import { sdk } from "@farcaster/frame-sdk";

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [tokenAddress, setTokenAddress] = useState(
    ethers.constants.AddressZero
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [frameState, setFrameState] = useState<"help" | "get-help">("help");

  useEffect(() => {
    // Hide the splash screen when the app is ready
    sdk.actions.ready();
  }, []);

  const handleCreateCampaign = async () => {
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

      const campaignAddress = await createCampaign(
        tokenAddress,
        campaignGoal,
        signer
      );

      if (campaignAddress) {
        setSuccess(`Campaign created successfully at ${campaignAddress}`);
        // Reset form
        setCampaignTitle("");
        setCampaignDescription("");
        setCampaignGoal("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error) {
      alert("Error searching for H3LP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">H3LP3R</h1>
            {address && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://warpcast.com/${address}.png`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-sm text-gray-600">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                <Button variant="outline" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {!isConnected ? (
            <div className="flex justify-center">
              <Button onClick={() => connect({ connector: injected() })}>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button
                    variant={frameState === "help" ? "default" : "outline"}
                    onClick={() => setFrameState("help")}
                  >
                    Help Others
                  </Button>
                  <Button
                    variant={frameState === "get-help" ? "default" : "outline"}
                    onClick={() => setFrameState("get-help")}
                  >
                    Get Help
                  </Button>
                </div>
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
