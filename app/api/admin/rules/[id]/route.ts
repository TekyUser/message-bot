import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (body.keyword !== undefined) {
      const keyword = String(body.keyword).trim().toLowerCase();
      if (!keyword) {
        return NextResponse.json(
          { error: "Keyword cannot be empty." },
          { status: 400 }
        );
      }
      update.keyword = keyword;
    }

    if (body.response !== undefined) {
      const response = String(body.response).trim();
      if (!response) {
        return NextResponse.json(
          { error: "Response cannot be empty." },
          { status: 400 }
        );
      }
      update.response = response;
    }

    if (body.enabled !== undefined) {
      update.enabled = Boolean(body.enabled);
    }

    update.updated_at = new Date().toISOString();

    const rules = await supabaseRequest(
      `keyword_rules?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(update),
      }
    );

    if (!rules.length) {
      return NextResponse.json(
        { error: "Rule not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule: rules[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update rule." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await supabaseRequest(
      `keyword_rules?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete rule." },
      { status: 500 }
    );
  }
}
