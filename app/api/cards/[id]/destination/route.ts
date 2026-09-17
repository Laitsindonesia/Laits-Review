import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateDestination } from "../../../../../lib/qr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function requireAdmin(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const anon = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized (admin only)" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const check = validateDestination(body.destination);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }
  const newDest = check.kind === "default" ? "" : check.value!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: card, error: fetchError } = await supabase
    .from("cards")
    .select('id, "Card ID", qr_token')
    .eq("id", id)
    .single();

  if (fetchError || !card) {
    return NextResponse.json({ error: "Kartu tidak ditemukan" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("cards")
    .update({ qr_destination: newDest })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Gagal menyimpan destination" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    card_id: card["Card ID"],
    qr_token: card.qr_token,
    qr_destination: newDest,
  });
}
