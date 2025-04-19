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
import { useState } from "react";
import { createCampaign } from "@/lib/contracts";
import { ethers } from "ethers";
import { CampaignList } from "@/components/CampaignList";

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
                <h2 className="text-2xl font-bold">Active H3LPs</h2>
                <Button onClick={() => (window.location.href = "/create")}>
                  Create H3LP
                </Button>
              </div>
              <div className="mb-4">
                <Input placeholder="Search H3LPs..." className="w-full" />
              </div>
              <CampaignList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
