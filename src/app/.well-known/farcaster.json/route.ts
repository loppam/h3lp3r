export async function GET() {
  const appUrl = "https://h3lp3r.vercel.app";

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjMyNDAzNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDM5OTgzOURlYUQ2NUIxNmVFOTdkOGRBZmI0NDVGMjQ0ODA5MUFhNTcifQ",
      payload: "eyJkb21haW4iOiJoM2xwM3IudmVyY2VsLmFwcCJ9",
      signature:
        "MHhkZTU5NzY5ZjFlMDY0YmU4ZmY5MGVmYzdhNWI5OTA1MWE0OTBjNzUyODVkNzg5ZDUyZjViNjY4ZmU1N2UzYTIxM2Q1OTczMzcwZDI5YzRjYTI5NzJhYmExY2EwNDQzYmI5MTY1MGM0NmFkZDU0ZDgxNjEwMzYwM2I5NTk4ZmRkZDFi",
    },
    frame: {
      version: "vNext",
      name: "H3LP3R",
      iconUrl: `${appUrl}/images/helper.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/helper.png`,
      buttonTitle: "H3LP",
      splashImageUrl: `${appUrl}/images/helper.png`,
      splashBackgroundColor: "#dfdfdf",
      webhookUrl: `${appUrl}/api/frames/launch`,
      authorizedDomains: ["h3lp3r.vercel.app"],
    },
  };

  return Response.json(config);
}
