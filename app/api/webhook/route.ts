import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");

    return new Response(challenge, {
      status: 200,
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}


async function sendMessengerMessage(
  recipientId: string,
  text: string
) {
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!token) {
    throw new Error("META_PAGE_ACCESS_TOKEN is missing");
  }

  const response = await fetch(
    "https://graph.facebook.com/v25.0/me/messages",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        recipient: {
          id: recipientId,
        },

        message: {
          text: text,
        },

        access_token: token,
      }),
    }
  );

  const data = await response.json();

  console.log("SEND API RESPONSE:", data);

  if (!response.ok) {
    throw new Error(
      `Messenger API error: ${JSON.stringify(data)}`
    );
  }

  return data;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("MESSENGER WEBHOOK RECEIVED");
    console.log(JSON.stringify(body, null, 2));
    console.log("=================================");

    const messaging = body.entry?.[0]?.messaging?.[0];

    const senderId = messaging?.sender?.id;
    const messageText = messaging?.message?.text;

    if (!senderId || !messageText) {
      return NextResponse.json({
        received: true,
      });
    }

    console.log("SENDER ID:", senderId);
    console.log("MESSAGE:", messageText);

    if (messageText.toLowerCase() === "secret") {
      await sendMessengerMessage(
        senderId,
        "ive spent 18 hours to do this"
      );
    }

    return NextResponse.json({
      received: true,
    });

  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}