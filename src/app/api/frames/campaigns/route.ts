import { FrameRequest, getFrameMessage } from "@farcaster/frame-core";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (!isValid) {
    return new NextResponse("Invalid frame request", { status: 400 });
  }

  // TODO: Fetch campaigns from your smart contract or database
  const campaigns = [
    { id: 1, title: "Sample Campaign 1", progress: "50%" },
    { id: 2, title: "Sample Campaign 2", progress: "75%" },
  ];

  // Return the campaign listing frame
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL}/images/campaigns.png" />
        <meta property="fc:frame:button:1" content="View Campaign 1" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/campaigns/1" />
        <meta property="fc:frame:button:2" content="View Campaign 2" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames/campaigns/2" />
        <meta property="fc:frame:button:3" content="Back" />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_URL}/api/frames" />
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
