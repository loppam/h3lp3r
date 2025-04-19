import { NextRequest, NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { untrustedData } = body;

  if (!untrustedData) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const campaign = await getCampaignByCode(untrustedData.campaignCode);

  if (!campaign) {
    return new NextResponse("Campaign not found", { status: 404 });
  }

  return new NextResponse(
    JSON.stringify({
      campaign,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
