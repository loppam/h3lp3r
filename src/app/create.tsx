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
import { useState, useEffect } from "react";
import { createCampaign } from "@/lib/contracts";
import { ethers } from "ethers";
import { sdk } from "@farcaster/frame-sdk";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Hide the splash screen when the app is ready
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

      // Convert USD to ETH (using a simple conversion rate for now)
      // In production, you'd want to use a real-time conversion rate
      const ethAmount = parseFloat(goalAmount) / 2000; // Assuming 1 ETH = $2000

      const h3lpAddress = await createCampaign(
        ethers.constants.AddressZero, // Using ETH only
        ethers.utils.parseEther(ethAmount.toString()).toString(),
        signer
      );

      if (h3lpAddress) {
        setSuccess(`H3LP created successfully at ${h3lpAddress}`);
        // Reset form
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
