import { NextRequest, NextResponse } from "next/server";
import { getCampaignByCode } from "@/lib/contracts";

interface FrameRequest {
  untrustedData?: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    state?: string;
    transactionId?: string;
    address?: string;
  };
  trustedData?: {
    messageBytes: string;
  };
}

function getFrameHtmlResponse(frame: {
  image: string;
  aspectRatio: string;
  buttons: Array<{
    label: string;
    action: "post" | "link";
    target_base_url?: string;
  }>;
  inputText?: string;
  postUrl?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${frame.image}" />
        <meta property="fc:frame:image:aspect_ratio" content="${
          frame.aspectRatio
        }" />
        ${frame.buttons
          .map(
            (button, index) => `
          <meta property="fc:frame:button:${index + 1}" content="${
              button.label
            }" />
          <meta property="fc:frame:button:${index + 1}:action" content="${
              button.action
            }" />
          ${
            button.target_base_url
              ? `<meta property="fc:frame:button:${
                  index + 1
                }:target_base_url" content="${button.target_base_url}" />`
              : ""
          }
        `
          )
          .join("")}
        ${
          frame.inputText
            ? `<meta property="fc:frame:input:text" content="${frame.inputText}" />`
            : ""
        }
        ${
          frame.postUrl
            ? `<meta property="fc:frame:post_url" content="${frame.postUrl}" />`
            : ""
        }
      </head>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: FrameRequest = await req.json();
    const inputText = body?.untrustedData?.inputText?.trim();
    const buttonIndex = body?.untrustedData?.buttonIndex;

    // Handle H3LP button (Search or View All)
    if (buttonIndex === 1) {
      if (inputText) {
        // If there's input text, try to find the specific campaign
        try {
          const campaign = await getCampaignByCode(inputText.toUpperCase());
          if (campaign) {
            return new NextResponse(
              getFrameHtmlResponse({
                image: "https://h3lp3r.vercel.app/images/helper.png",
                aspectRatio: "1.91:1",
                buttons: [
                  {
                    label: "View Campaign",
                    action: "link",
                    target_base_url: `https://h3lp3r.vercel.app/campaign/${campaign.address}`,
                  },
                  {
                    label: "GET H3LP",
                    action: "link",
                    target_base_url: "https://h3lp3r.vercel.app",
                  },
                ],
              })
            );
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
        }
      }

      // If no input or campaign not found, redirect to view all campaigns
      return new NextResponse(
        getFrameHtmlResponse({
          image: "https://h3lp3r.vercel.app/images/helper.png",
          aspectRatio: "1.91:1",
          buttons: [
            {
              label: "View All Campaigns",
              action: "link",
              target_base_url: "https://h3lp3r.vercel.app",
            },
            {
              label: "GET H3LP",
              action: "link",
              target_base_url: "https://h3lp3r.vercel.app",
            },
          ],
        })
      );
    }

    // Default response (should not reach here as button 2 is direct link)
    return new NextResponse(
      getFrameHtmlResponse({
        image: "https://h3lp3r.vercel.app/images/helper.png",
        aspectRatio: "1.91:1",
        buttons: [
          {
            label: "H3LP",
            action: "post",
          },
          {
            label: "GET H3LP",
            action: "link",
            target_base_url: "https://h3lp3r.vercel.app",
          },
        ],
        inputText: "Enter H3LP code (optional)",
        postUrl: "https://h3lp3r.vercel.app/api/frames/launch",
      })
    );
  } catch (error) {
    console.error("Error processing frame request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
