import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import {
  Campaign,
  getCampaignByCode,
  fundCampaign,
  withdrawCampaign,
} from "@/lib/contracts";
import { Progress } from "@/components/ui/progress";
import { SocialShare } from "@/components/SocialShare";
import { useToast } from "@/hooks/use-toast";

interface CampaignDetailsProps {
  code: string;
}

export function CampaignDetails({ code }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const campaignData = await getCampaignByCode(code);
        setCampaign(campaignData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch campaign"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [code]);

  const handleContribute = async () => {
    if (!campaign || !address) return;

    try {
      setIsContributing(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("No Ethereum provider found");
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();

      await fundCampaign(
        campaign.address,
        contributionAmount,
        campaign.tokenAddress,
        signer
      );

      toast({
        title: "Success!",
        description: `Successfully contributed ${contributionAmount} ETH to the campaign.`,
        variant: "success",
      });

      // Refresh campaign data
      const updatedCampaign = await getCampaignByCode(code);
      setCampaign(updatedCampaign);
      setContributionAmount("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to contribute";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!campaign || !address) return;

    try {
      setIsWithdrawing(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("No Ethereum provider found");
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();

      await withdrawCampaign(campaign.address, signer);

      toast({
        title: "Success!",
        description: "Successfully withdrawn funds from the campaign.",
        variant: "success",
      });

      // Refresh campaign data
      const updatedCampaign = await getCampaignByCode(code);
      setCampaign(updatedCampaign);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to withdraw";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Campaign not found</p>
      </div>
    );
  }

  const progress = (Number(campaign.raised) / Number(campaign.goal)) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Campaign #{code}</CardTitle>
              <CardDescription>
                Created by: {campaign.creator.slice(0, 6)}...
                {campaign.creator.slice(-4)}
              </CardDescription>
            </div>
            <SocialShare campaignCode={code} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Progress</h3>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2">
                <span>
                  {ethers.utils.formatEther(campaign.raised)} ETH raised
                </span>
                <span>{ethers.utils.formatEther(campaign.goal)} ETH goal</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <p>{campaign.isActive ? "Active" : "Completed"}</p>
            </div>

            {campaign.tokenAddress !== ethers.constants.AddressZero && (
              <div>
                <h3 className="font-semibold mb-2">Token</h3>
                <p>
                  {campaign.tokenAddress.slice(0, 6)}...
                  {campaign.tokenAddress.slice(-4)}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Contribute</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1"
                />
                <Button
                  onClick={handleContribute}
                  disabled={isContributing || !contributionAmount}
                >
                  {isContributing ? "Contributing..." : "Contribute"}
                </Button>
              </div>
            </div>

            {address === campaign.creator && (
              <div>
                <Button
                  variant="destructive"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || Number(campaign.raised) === 0}
                >
                  {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
