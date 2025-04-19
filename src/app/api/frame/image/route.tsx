import { ImageResponse } from "next/og";
import Image from "next/image";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const contributed = searchParams.get("contributed");

  try {
    const response = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_APP_URL}/helper.png`}
              alt="Helper Icon"
              width={80}
              height={80}
              style={{ marginRight: "20px" }}
            />
            <Image
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              alt="H3LP3R Logo"
              width={200}
              height={60}
            />
          </div>
          {code && (
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginTop: "20px",
              }}
            >
              H3LP Code: {code}
            </div>
          )}
          {contributed && (
            <div
              style={{
                fontSize: "24px",
                color: "#22c55e",
                marginTop: "20px",
              }}
            >
              Contributed: ${contributed}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Set caching headers
    response.headers.set(
      "Cache-Control",
      "public, immutable, no-transform, max-age=300"
    );

    return response;
  } catch (e) {
    console.error(e);
    const errorResponse = new Response("Failed to generate image", {
      status: 500,
    });
    // Don't cache error responses
    errorResponse.headers.set("Cache-Control", "no-store");
    return errorResponse;
  }
}
