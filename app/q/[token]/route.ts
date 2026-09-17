import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateDestination, resolveRedirectTarget } from "../../../lib/qr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const clean = (token || "").trim().toUpperCase();

  if (!clean) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("cards")
    .select('"Card ID", qr_destination')
    .eq("qr_token", clean)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "QR tidak ditemukan" }, { status: 404 });
  }

  const cardId = data["Card ID"] as string;
  const rawDest = (data.qr_destination || "") as string;
  const target = resolveRedirectTarget(rawDest, cardId);

  // Default: kembali ke halaman review bawaan
  if (!rawDest) {
    return NextResponse.redirect(new URL(target, request.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const check = validateDestination(rawDest);
  if (!check.ok || !check.value) {
    // Destination rusak -> fallback aman ke review, jangan open redirect
    return NextResponse.redirect(new URL(`/r/${cardId}`, request.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (check.kind === "internal") {
    return NextResponse.redirect(new URL(check.value, request.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.redirect(check.value, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
