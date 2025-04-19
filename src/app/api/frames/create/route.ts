import { FrameRequest, getFrameMessage } from "@farcaster/frame-core";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (!isValid) {
    return new NextResponse("Invalid frame request", { status: 400 });
  }

  // Return the campaign creation form frame
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL}/images/create-campaign.png" />
        <meta property="fc:frame:input:text" content="Campaign Title" />
        <meta property="fc:frame:input:text" content="Description" />
        <meta property="fc:frame:input:text" content="Goal Amount (ETH)" />
        <meta property="fc:frame:button:1" content="Create Campaign" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/create/submit" />
        <meta property="fc:frame:button:2" content="Back" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames" />
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
