import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/frame-node";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { sendNotification } from "@/lib/notifs";

type EventType =
  | "frame_added"
  | "frame_removed"
  | "notifications_enabled"
  | "notifications_disabled"
  | "contribution";

interface NotificationDetails {
  enabled: boolean;
  channel: string;
  settings?: Record<string, unknown>;
}

interface WebhookEvent {
  event: EventType;
  notificationDetails?: NotificationDetails;
}

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 }
        );
    }
  }

  const fid = data.fid;
  const event = data.event as WebhookEvent;

  switch (event.event) {
    case "frame_added":
      if (event.notificationDetails) {
        await kv.set(`notificationDetails-${fid}`, event.notificationDetails);
        await sendNotification({
          fid,
          title: "Welcome to Frames v2",
          message: "Frame is now added to your client",
        });
      } else {
        await kv.delete(`notificationDetails-${fid}`);
      }

      break;
    case "frame_removed":
      await kv.delete(`notificationDetails-${fid}`);

      break;
    case "notifications_enabled":
      await kv.set(`notificationDetails-${fid}`, event.notificationDetails);
      await sendNotification({
        fid,
        title: "Ding ding ding",
        message: "Notifications are now enabled",
      });

      break;
    case "notifications_disabled":
      await kv.delete(`notificationDetails-${fid}`);

      break;
    case "contribution":
      const notificationDetails = await kv.get<NotificationDetails>(
        `notificationDetails-${fid}`
      );
      if (notificationDetails) {
        await sendNotification({
          fid,
          title: "New Contribution",
          message: `Someone contributed to your campaign!`,
        });
      }

      break;
  }

  return NextResponse.json({ success: true });
}
