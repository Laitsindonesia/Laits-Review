import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { ACTIVATION_MODE_DIRECT, isValidActivationMode } from "../../../lib/qr";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data tidak valid" },
      { status: 400 }
    );
  }
  const { companyName, address, phone, placeId, pin, mode } = body;

  if (!companyName || !phone) {
    return NextResponse.json(
      { error: "Nama bisnis dan nomor telepon wajib diisi" },
      { status: 400 }
    );
  }

  if (!isValidActivationMode(mode)) {
    return NextResponse.json(
      {
        error:
          "Mode aktivasi wajib dipilih: Direct Google Review atau Laits Software",
      },
      { status: 400 }
    );
  }

  const cleanPlaceId = typeof placeId === "string" ? placeId.trim() : "";
  if (mode === ACTIVATION_MODE_DIRECT && !cleanPlaceId) {
    return NextResponse.json(
      {
        error:
          "Pilih alamat bisnis dari daftar saran Google Maps untuk mode Direct Google Review",
      },
      { status: 400 }
    );
  }

  const { data: unclaimedCards, error: fetchError } = await supabase
    .from("cards")
    .select("*")
    .eq("Card Status", false);

  if (fetchError || !unclaimedCards || unclaimedCards.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada kartu yang tersedia. Silakan hubungi admin." },
      { status: 404 }
    );
  }

  unclaimedCards.sort(
    (a, b) => parseInt(a["Card ID"], 10) - parseInt(b["Card ID"], 10)
  );
  const unclaimed = unclaimedCards[0];

  const { error: updateError } = await supabase
    .from("cards")
    .update({
      "Nama Bisnis": companyName,
      "Nomor Telpon": phone,
      "Card Status": true,
      "Pin": pin ? hashPin(String(pin)) : null,
      "PlaceId": cleanPlaceId,
      activation_mode: mode,
    })
    .eq("id", unclaimed.id)
    .eq("Card Status", false);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal claim kartu. Silakan coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    card_id: unclaimed["Card ID"],
    business_name: companyName,
    phone: phone,
    placeId: cleanPlaceId,
    activation_mode: mode,
  });
}
