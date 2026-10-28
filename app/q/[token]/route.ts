import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { determineCardDestination } from "../../../lib/qr";

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
    .select('"Card ID", qr_destination, "PlaceId", activation_mode')
    .eq("qr_token", clean)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "QR tidak ditemukan" }, { status: 404 });
  }

  const cardId = data["Card ID"] as string;

  // Prioritas: endpoint admin > mode aktivasi > default /r/[Card ID]
  const dest = determineCardDestination({
    qrDestination: (data.qr_destination || "") as string,
    cardId,
    activationMode: (data.activation_mode as string | null) ?? null,
    placeId: (data.PlaceId as string | null) ?? null,
  });

  if (dest.kind === "external") {
    return NextResponse.redirect(dest.url, {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.redirect(new URL(dest.path, request.url), {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
