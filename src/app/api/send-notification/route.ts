import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  // TODO: Implement notification sending logic
  return new Response("Notification sent", { status: 200 });
}
