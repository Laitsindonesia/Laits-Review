import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { cardId, pin } = body;

  if (!cardId || !pin) {
    return NextResponse.json(
      { error: "cardId dan pin wajib diisi" },
      { status: 400 }
    );
  }

  const { data: card, error } = await supabase
    .from("cards")
    .select("Pin")
    .eq("id", cardId)
    .single();

  if (error || !card) {
    return NextResponse.json(
      { error: "Kartu tidak ditemukan" },
      { status: 404 }
    );
  }

  if (!card.Pin) {
    return NextResponse.json({ valid: true });
  }

  const isValid = card.Pin === hashPin(String(pin));

  return NextResponse.json({ valid: isValid });
}
