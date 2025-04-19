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
        window.ethereum as any
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
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-7xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">H3LP3R</h1>
        <p className="text-xl mb-8 text-center">
          Decentralized Crowdfunding Platform
        </p>

        {!isConnected ? (
          <div className="flex justify-center">
            <Button onClick={() => connect({ connector: injected() })}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>
                  Start a new crowdfunding campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={campaignTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCampaignTitle(e.target.value)
                      }
                      placeholder="Enter campaign title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={campaignDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCampaignDescription(e.target.value)
                      }
                      placeholder="Enter campaign description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal Amount (ETH)</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={campaignGoal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCampaignGoal(e.target.value)
                      }
                      placeholder="Enter goal amount in ETH"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token">Token Address (Optional)</Label>
                    <Input
                      id="token"
                      value={tokenAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTokenAddress(e.target.value)
                      }
                      placeholder="Enter token address (0x...) or leave empty for ETH"
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  {success && (
                    <div className="text-green-500 text-sm">{success}</div>
                  )}
                  <Button onClick={handleCreateCampaign} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
              <CampaignList />
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => disconnect()}>
                Disconnect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
