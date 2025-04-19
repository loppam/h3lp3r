import { NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";
import { frameConfig } from "../../frame";

// Function to send Farcaster notification
async function sendFarcasterNotification(
  recipientFid: string,
  title: string,
  body: string,
  url: string
) {
  const response = await fetch("https://api.farcaster.xyz/v2/notifications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FARCASTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipientFid,
      title,
      body,
      url,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send notification");
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

      // Send notification to campaign creator
      try {
        await sendFarcasterNotification(
          campaign.creator,
          "New Contribution! 🎉",
          `Someone contributed $${contributionAmount} to your campaign "${campaign.title}"`,
          `/campaign/${code}`
        );
      } catch (error) {
        console.error("Failed to send contribution notification:", error);
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

export async function POST(req: Request) {
  const body = await req.json();
  const { buttonIndex, inputText, fid, verifiedWalletAddress } = body;

  // Verify the user is authenticated
  if (!fid || !verifiedWalletAddress) {
    return NextResponse.json({
      type: "error",
      message: "Please connect your Farcaster account and wallet",
    });
  }

  // Handle different button actions
  if (buttonIndex === 1) {
    // H3LP button clicked
    if (inputText) {
      try {
        const campaign = await getCampaignByCode(inputText);
        if (campaign) {
          // Return frame with campaign details
          return NextResponse.json({
            name: `Campaign #${inputText}`,
            description: `Campaign found: ${campaign.title}`,
            image: `${
              process.env.NEXT_PUBLIC_HOST
            }/api/image?text=${encodeURIComponent(
              `Campaign found: ${campaign.title}`
            )}`,
            buttons: [
              {
                label: "View Campaign",
                action: "link",
                target: `${process.env.NEXT_PUBLIC_HOST}/campaign/${campaign.address}`,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error finding campaign:", error);
      }
    }
    return NextResponse.json({
      type: "frame",
      frameUrl: `${process.env.NEXT_PUBLIC_APP_URL}/help`,
      buttons: frameConfig.buttons,
    });
  } else if (buttonIndex === 2) {
    // GET H3LP button clicked
    return NextResponse.json({
      type: "frame",
      frameUrl: `${process.env.NEXT_PUBLIC_APP_URL}/get-help`,
      buttons: frameConfig.buttons,
    });
  }

  return NextResponse.json({
    type: "frame",
    frameUrl: process.env.NEXT_PUBLIC_APP_URL,
    buttons: frameConfig.buttons,
  });
}
