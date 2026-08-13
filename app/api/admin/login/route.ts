import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function sign(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(value)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { error: "Admin environment variables are not configured." },
      { status: 500 }
    );
  }

  if (
    typeof password !== "string" ||
    password.length !== expected.length ||
    !timingSafeEqual(Buffer.from(password), Buffer.from(expected))
  ) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const timestamp = Date.now().toString();
  const value = `${timestamp}.${sign(timestamp)}`;

  const response = NextResponse.json({ ok: true });

  response.cookies.set("admin_session", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
