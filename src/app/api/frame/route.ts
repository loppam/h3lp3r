import { NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";

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
        contributionAmount = customAmount;
      } else if (amount) {
        contributionAmount = amount;
      }

      return NextResponse.json({
        name: `Campaign #${code}`,
        description: `Successfully contributed $${contributionAmount}!`,
        image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frame/image?code=${code}&contributed=${contributionAmount}&usd=${contributionAmount}`,
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
