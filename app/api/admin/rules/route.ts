import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rules = await supabaseRequest(
      "keyword_rules?select=id,keyword,response,enabled,created_at,updated_at&order=created_at.desc"
    );

    return NextResponse.json({ rules });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load rules." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const keyword = String(body.keyword ?? "").trim().toLowerCase();
    const response = String(body.response ?? "").trim();

    if (!keyword || !response) {
      return NextResponse.json(
        { error: "Keyword and response are required." },
        { status: 400 }
      );
    }

    const rules = await supabaseRequest("keyword_rules", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        keyword,
        response,
        enabled: true,
      }),
    });

    return NextResponse.json({ rule: rules[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create rule." },
      { status: 500 }
    );
  }
}
