import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Bisnis tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Bisnis tidak ditemukan" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("businesses")
    .update({ ...body, id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Bisnis tidak ditemukan" },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("businesses").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Bisnis berhasil dihapus" });
}
