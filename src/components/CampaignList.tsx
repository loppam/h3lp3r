"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Campaign, getCampaigns } from "@/lib/contracts";
import { Progress } from "@/components/ui/progress";

const ITEMS_PER_PAGE = 9;

interface CampaignListProps {
  searchQuery: string;
}

export function CampaignList({ searchQuery }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const fetchedCampaigns = await getCampaigns();
        setCampaigns(fetchedCampaigns);
        setFilteredCampaigns(fetchedCampaigns);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch campaigns"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCampaigns(filtered);
      setCurrentPage(1);
    } else {
      setFilteredCampaigns(campaigns);
    }
  }, [searchQuery, campaigns]);

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Loading campaigns...</p>
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

  if (campaigns.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>No campaigns found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCampaigns.map((campaign) => (
          <Card key={campaign.address} className="flex flex-col">
            <CardHeader>
              <CardTitle>{campaign.title}</CardTitle>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div>
                  <Progress
                    value={
                      (Number(campaign.raised) / Number(campaign.goal)) * 100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between mt-2">
                    <span>{ethers.utils.formatEther(campaign.raised)} ETH</span>
                    <span>{ethers.utils.formatEther(campaign.goal)} ETH</span>
                  </div>
                </div>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {campaign.isActive ? "Active" : "Completed"}
                </p>
                {campaign.tokenAddress !== ethers.constants.AddressZero && (
                  <p>
                    <span className="font-semibold">Token:</span>{" "}
                    {campaign.tokenAddress.slice(0, 6)}...
                    {campaign.tokenAddress.slice(-4)}
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" asChild>
                  <a
                    href={`/campaigns/${campaign.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details
                  </a>
                </Button>
                {address?.toLowerCase() === campaign.creator.toLowerCase() && (
                  <Button variant="destructive">Withdraw</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
