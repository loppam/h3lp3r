import { NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";
import { ethers } from "ethers";

// Simple ETH price fetch (in a real app, you'd want to use a more reliable price feed)
async function getEthPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return 2000; // Fallback price
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const contributed = searchParams.get("contributed");
  const usdAmount = searchParams.get("usd");
  const action = searchParams.get("action");

  if (!code) {
    return NextResponse.json(
      {
        error: "Campaign code is required",
      },
      { status: 400 }
    );
  }

  try {
    const campaign = await getCampaignByCode(code);
    const ethPrice = await getEthPrice();

    if (!campaign) {
      return NextResponse.json(
        {
          error: "Campaign not found",
        },
        { status: 404 }
      );
    }

    const progress = (Number(campaign.raised) / Number(campaign.goal)) * 100;
    const raised = ethers.utils.formatEther(campaign.raised);
    const goal = ethers.utils.formatEther(campaign.goal);

    // Convert ETH amounts to USD
    const raisedUSD = (Number(raised) * ethPrice).toFixed(2);
    const goalUSD = (Number(goal) * ethPrice).toFixed(2);

    // Create an SVG image
    const svg = `
      <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1A1A1A"/>
        <text x="300" y="80" font-family="Arial" font-size="32" fill="white" text-anchor="middle">
          Campaign #${code}
        </text>
        <text x="300" y="130" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
          Progress: ${progress.toFixed(2)}%
        </text>
        <text x="300" y="180" font-family="Arial" font-size="20" fill="white" text-anchor="middle">
          $${raisedUSD} raised of $${goalUSD} goal
        </text>
        ${
          contributed && usdAmount
            ? `
          <text x="300" y="230" font-family="Arial" font-size="20" fill="#4CAF50" text-anchor="middle">
            +$${usdAmount} contributed!
          </text>
        `
            : ""
        }
        ${
          action === "custom"
            ? `
          <text x="300" y="280" font-family="Arial" font-size="20" fill="white" text-anchor="middle">
            Enter custom amount ($)
          </text>
          <rect x="200" y="300" width="200" height="40" fill="#333333" rx="5"/>
          <text x="300" y="325" font-family="Arial" font-size="16" fill="white" text-anchor="middle">
            Type amount and press Enter
          </text>
        `
            : `
          <rect x="50" y="280" width="500" height="20" fill="#333333"/>
          <rect x="50" y="280" width="${
            progress * 5
          }" height="20" fill="#4CAF50"/>
          <text x="300" y="350" font-family="Arial" font-size="16" fill="white" text-anchor="middle">
            Choose an amount to contribute
          </text>
        `
        }
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
