import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ card_id: string }> }
) {
  const { card_id } = await params;

  const { data, error } = await supabase
    .from("cards")
    .select('"Card ID", "Card Status", "Nama Bisnis", "Nomor Telpon", "PlaceId"')
    .eq("Card ID", card_id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Kartu tidak ditemukan", claimed: false },
      { status: 404 }
    );
  }

  return NextResponse.json({
    card_id: data["Card ID"],
    claimed: data["Card Status"],
    business_name: data["Nama Bisnis"] || "",
    phone: data["Nomor Telpon"] || "",
    place_id: data["PlaceId"] || "",
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ card_id: string }> }
) {
  const { card_id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data tidak valid" },
      { status: 400 }
    );
  }

  const { companyName, address, phone, placeId, pin } = body;

  if (!phone) {
    return NextResponse.json(
      { error: "Nomor WhatsApp wajib diisi" },
      { status: 400 }
    );
  }

  const { data: card, error: fetchError } = await supabase
    .from("cards")
    .select("*")
    .eq("Card ID", card_id)
    .single();

  if (fetchError || !card) {
    return NextResponse.json(
      { error: "Kartu tidak ditemukan" },
      { status: 404 }
    );
  }

  if (card["Card Status"] === true) {
    return NextResponse.json(
      { error: "Kartu ini sudah di-claim sebelumnya" },
      { status: 409 }
    );
  }

  const { error: updateError } = await supabase
    .from("cards")
    .update({
      "Nama Bisnis": companyName || "",
      "Nomor Telpon": phone,
      "Card Status": true,
      "Pin": pin ? hashPin(String(pin)) : null,
      "PlaceId": placeId || "",
    })
    .eq("Card ID", card_id)
    .eq("Card Status", false);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal mengaktifkan kartu. Silakan coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    card_id: card_id,
    business_name: companyName || "",
    phone: phone,
    place_id: placeId || "",
  });
}
