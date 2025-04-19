import { FrameRequest, getFrameMessage } from "@farcaster/frame-core";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (!isValid) {
    return new NextResponse("Invalid frame request", { status: 400 });
  }

  const campaignId = params.id;
  // TODO: Fetch campaign details from your smart contract or database
  const campaign = {
    id: campaignId,
    title: "Sample Campaign",
    description: "This is a sample campaign description",
    goal: "1 ETH",
    raised: "0.5 ETH",
    progress: "50%",
  };

  // Return the campaign details frame
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL}/images/campaign-${campaignId}.png" />
        <meta property="fc:frame:input:text" content="Contribution Amount (ETH)" />
        <meta property="fc:frame:button:1" content="Contribute" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/campaigns/${campaignId}/contribute" />
        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/campaigns/${campaignId}/share" />
        <meta property="fc:frame:button:3" content="Back" />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/campaigns" />
      </head>
    </html>
  `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
