import { NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";

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
  const action = searchParams.get("action");
  const amount = searchParams.get("amount");
  const customAmount = searchParams.get("customAmount");

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

    // Handle contribution actions
    if (action === "contribute") {
      let contributionAmount = "0";

      if (customAmount) {
        // Convert USD to ETH
        contributionAmount = (Number(customAmount) / ethPrice).toFixed(6);
      } else if (amount) {
        // Convert USD to ETH
        contributionAmount = (Number(amount) / ethPrice).toFixed(6);
      }

      // In a real implementation, you would handle the contribution here
      // For now, we'll just return a success message
      return NextResponse.json({
        name: `Campaign #${code}`,
        description: `Successfully contributed ${contributionAmount} ETH ($${
          amount || customAmount
        })!`,
        image: `${
          process.env.NEXT_PUBLIC_APP_URL
        }/api/frame/image?code=${code}&contributed=${contributionAmount}&usd=${
          amount || customAmount
        }`,
        buttons: [
          {
            label: "View Campaign",
            action: "link",
            target: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${code}`,
          },
        ],
      });
    }

    // Default frame with contribution options
    return NextResponse.json({
      name: `Campaign #${code}`,
      description: `Progress: ${progress.toFixed(2)}%`,
      image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?code=${code}`,
      buttons: [
        {
          label: "$1",
          action: "post",
          target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame?code=${code}&action=contribute&amount=1`,
        },
        {
          label: "$5",
          action: "post",
          target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame?code=${code}&action=contribute&amount=5`,
        },
        {
          label: "$10",
          action: "post",
          target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame?code=${code}&action=contribute&amount=10`,
        },
        {
          label: "Custom Amount",
          action: "post",
          target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame?code=${code}&action=custom`,
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch campaign",
      },
      { status: 500 }
    );
  }
}
