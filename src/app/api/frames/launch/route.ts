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

interface FrameButton {
  label: string;
  action: "post" | "link";
  target: string;
}

interface FrameImage {
  src: string;
  aspectRatio: string;
}

interface FrameInput {
  text: string;
}

interface FrameResponse {
  image: FrameImage;
  buttons: FrameButton[];
  input?: FrameInput;
  postUrl: string;
}

function getFrameHtmlResponse(frame: FrameResponse) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${frame.image.src}" />
        <meta property="fc:frame:image:aspect_ratio" content="${
          frame.image.aspectRatio
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
          <meta property="fc:frame:button:${index + 1}:target" content="${
              button.target
            }" />
        `
          )
          .join("")}
        ${
          frame.input
            ? `
          <meta property="fc:frame:input:text" content="${frame.input.text}" />
        `
            : ""
        }
        <meta property="fc:frame:post_url" content="${frame.postUrl}" />
      </head>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = { isValid: true, message: body }; // Temporary fix until proper validation

    if (!isValid) {
      return new NextResponse("Invalid frame message", { status: 400 });
    }

    const inputText = message?.untrustedData?.inputText;
    const buttonIndex = message?.untrustedData?.buttonIndex;

    // Handle the H3LP button click
    if (buttonIndex === 1) {
      if (inputText) {
        // If there's input text, try to find the campaign
        try {
          const campaign = await getCampaignByCode(inputText.toUpperCase());
          if (campaign) {
            return new NextResponse(
              getFrameHtmlResponse({
                image: {
                  src: `https://h3lp3r.vercel.app/images/helper.png`,
                  aspectRatio: "1.91:1",
                },
                buttons: [
                  {
                    label: "View Campaign",
                    action: "link",
                    target: `https://h3lp3r.vercel.app/campaign/${campaign.address}`,
                  },
                ],
                postUrl: `https://h3lp3r.vercel.app/api/frames/launch`,
              })
            );
          } else {
            // Campaign not found
            return new NextResponse(
              getFrameHtmlResponse({
                image: {
                  src: `https://h3lp3r.vercel.app/images/helper.png`,
                  aspectRatio: "1.91:1",
                },
                buttons: [
                  {
                    label: "Try Again",
                    action: "post",
                    target: `https://h3lp3r.vercel.app/api/frames/launch`,
                  },
                ],
                input: {
                  text: "Enter H3LP code",
                },
                postUrl: `https://h3lp3r.vercel.app/api/frames/launch`,
              })
            );
          }
        } catch (error) {
          console.error("Error fetching campaign:", error);
          return new NextResponse(
            getFrameHtmlResponse({
              image: {
                src: `https://h3lp3r.vercel.app/images/helper.png`,
                aspectRatio: "1.91:1",
              },
              buttons: [
                {
                  label: "Try Again",
                  action: "post",
                  target: `https://h3lp3r.vercel.app/api/frames/launch`,
                },
              ],
              input: {
                text: "Enter H3LP code",
              },
              postUrl: `https://h3lp3r.vercel.app/api/frames/launch`,
            })
          );
        }
      } else {
        // Initial frame state - ask for H3LP code
        return new NextResponse(
          getFrameHtmlResponse({
            image: {
              src: `https://h3lp3r.vercel.app/images/helper.png`,
              aspectRatio: "1.91:1",
            },
            buttons: [
              {
                label: "H3LP",
                action: "post",
                target: `https://h3lp3r.vercel.app/api/frames/launch`,
              },
            ],
            input: {
              text: "Enter H3LP code",
            },
            postUrl: `https://h3lp3r.vercel.app/api/frames/launch`,
          })
        );
      }
    }

    // Default response
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `https://h3lp3r.vercel.app/images/helper.png`,
          aspectRatio: "1.91:1",
        },
        buttons: [
          {
            label: "H3LP",
            action: "post",
            target: `https://h3lp3r.vercel.app/api/frames/launch`,
          },
        ],
        input: {
          text: "Enter H3LP code",
        },
        postUrl: `https://h3lp3r.vercel.app/api/frames/launch`,
      })
    );
  } catch (error) {
    console.error("Error processing frame request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
