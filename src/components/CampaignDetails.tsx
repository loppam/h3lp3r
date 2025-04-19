import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { getCampaignDetails } from "@/lib/contracts";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/Button";

interface CampaignDetails {
  creator: string;
  tokenAddress: string;
  goalAmount: string;
  totalFunds: string;
  isWithdrawn: boolean;
}

export function CampaignDetails() {
  const { address } = useParams<{ address: string }>();
  const { address: userAddress } = useAccount();
  const [details, setDetails] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        if (!address) return;
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as ethers.providers.ExternalProvider
        );
        const campaignDetails = await getCampaignDetails(address, provider);
        setDetails(campaignDetails);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch campaign details"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [address]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!details) return <div>Campaign not found</div>;

  const progress =
    (Number(details.totalFunds) / Number(details.goalAmount)) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Campaign Details</h2>
        <p>Creator: {details.creator}</p>
        <p>Goal: {ethers.utils.formatEther(details.goalAmount)} ETH</p>
        <p>Raised: {ethers.utils.formatEther(details.totalFunds)} ETH</p>
        <Progress value={progress} className="w-full" />
        <p>Progress: {progress.toFixed(2)}%</p>
      </div>
      {userAddress?.toLowerCase() === details.creator.toLowerCase() &&
        !details.isWithdrawn && <Button>Withdraw Funds</Button>}
    </div>
  );
}
