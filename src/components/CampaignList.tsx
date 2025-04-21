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
import { Campaign, getCampaigns, getCampaignByCode } from "@/lib/contracts";
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

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (searchQuery.length === 4) {
          // Search by code
          const campaign = await getCampaignByCode(searchQuery);
          if (campaign) {
            setCampaigns([campaign]);
          } else {
            setCampaigns([]);
          }
        } else {
          // Get all campaigns
          const allCampaigns = await getCampaigns();
          setCampaigns(allCampaigns);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load campaigns"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [searchQuery]);

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
        {currentCampaigns.map((campaign) => {
          const goal = parseFloat(ethers.utils.formatEther(campaign.goal));
          const raised = parseFloat(ethers.utils.formatEther(campaign.raised));
          const progress = (raised / goal) * 100;

          return (
            <Card
              key={campaign.address}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{campaign.title}</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {campaign.code}
                  </span>
                </CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Raised: {raised.toFixed(4)} ETH</span>
                    <span>Goal: {goal.toFixed(4)} ETH</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      (window.location.href = `/campaign/${campaign.address}`)
                    }
                  >
                    View Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
