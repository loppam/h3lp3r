import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/contracts";

export async function GET() {
  const campaigns = await getCampaigns();

  return new NextResponse(
    JSON.stringify({
      campaigns,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
