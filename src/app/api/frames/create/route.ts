import { NextRequest, NextResponse } from "next/server";
import { createCampaign } from "@/lib/contracts";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { untrustedData } = body;

  if (!untrustedData) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const { tokenAddress, goal } = untrustedData;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );
  const signer = provider.getSigner();

  const campaign = await createCampaign(
    tokenAddress || ethers.constants.AddressZero,
    goal || "1.0",
    signer,
    "Untitled Campaign",
    "No description provided",
    undefined
  );

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
