import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const DOWNLOAD_LIMIT = 3;
const ACCESS_WINDOW_DAYS = 7;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: admin, error: adminError } = await authClient
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    return NextResponse.json({ error: "Could not verify admin access" }, { status: 500 });
  }
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ACCESS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const supabaseAdmin = createAdminClient();
  const { data: purchase, error: updateError } = await supabaseAdmin
    .from("purchases")
    .update({
      downloads_used: 0,
      download_limit: DOWNLOAD_LIMIT,
      download_expires_at: expiresAt.toISOString(),
    })
    .eq("id", id)
    .eq("status", "success")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Purchase download reset failed:", updateError);
    return NextResponse.json({ error: "Could not reset download access" }, { status: 500 });
  }
  if (!purchase) {
    return NextResponse.json({ error: "Successful purchase not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Download access reset",
    downloadsRemaining: DOWNLOAD_LIMIT,
    expiresAt: expiresAt.toISOString(),
  });
}