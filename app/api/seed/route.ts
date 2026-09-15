import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH_SIZE = 500;
const START_ID = 1;
const END_ID = 200;

export async function POST() {
  try {
    const { error: deleteError } = await supabase
      .from("cards")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      return NextResponse.json(
        { error: `Gagal hapus data lama: ${deleteError.message}` },
        { status: 500 }
      );
    }

    const totalCards = END_ID - START_ID + 1;
    let inserted = 0;

    for (let batchStart = START_ID; batchStart <= END_ID; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, END_ID);
      const rows = [];

      for (let i = batchStart; i <= batchEnd; i++) {
        rows.push({
          "Card ID": `57${i}`,
          "Nama Bisnis": "",
          "Nomor Telpon": "",
          "Card Status": false,
        });
      }

      const { error: insertError } = await supabase.from("cards").insert(rows);

      if (insertError) {
        return NextResponse.json(
          { error: `Gagal insert batch di ID ${batchStart}: ${insertError.message}` },
          { status: 500 }
        );
      }

      inserted += rows.length;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil! ${inserted} kartu dari 571 - 57200 telah dibuat.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
