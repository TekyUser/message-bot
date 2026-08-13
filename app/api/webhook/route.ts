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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("MESSENGER WEBHOOK RECEIVED");
    console.log(JSON.stringify(body, null, 2));
    console.log("=================================");

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
