import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { count } = body;

    if (!count || typeof count !== "number" || count <= 0 || count > 1000) {
      return NextResponse.json(
        { error: "Jumlah kartu harus antara 1 dan 1000" },
        { status: 400 }
      );
    }

    const prefix = "57";
    const { data: existing, error: fetchError } = await supabase
      .from("cards")
      .select("*");

    if (fetchError) {
      return NextResponse.json(
        { error: `Gagal mengambil data: ${fetchError.message}` },
        { status: 500 }
      );
    }

    let maxNum = 0;
    if (existing && existing.length > 0) {
      const numbers = existing
        .map((c) => c["Card ID"])
        .filter((id: string) => id && id.startsWith(prefix))
        .map((id: string) => parseInt(id.slice(prefix.length), 10))
        .filter((n: number) => !isNaN(n));
      if (numbers.length > 0) {
        maxNum = numbers.reduce((a: number, b: number) => Math.max(a, b), 0);
      }
    }

    const rows = [];
    for (let i = 0; i < count; i++) {
      const cardId = `${prefix}${maxNum + i + 1}`;
      rows.push({
        "Card ID": cardId,
        "Nama Bisnis": "",
        "Nomor Telpon": "",
        "Card Status": false,
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("cards")
      .insert(rows)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: `Gagal insert batch: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat ${count} kartu dari ${prefix}${maxNum + 1} - ${prefix}${maxNum + count}`,
      cards: inserted,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
