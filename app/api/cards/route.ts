import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data, error } = await supabase
    .from("cards")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const safeData = data.map(({ Pin, sort_order, ...rest }) => rest);

  safeData.sort((a, b) => {
    const numA = parseInt(a["Card ID"] || "0", 10) || 0;
    const numB = parseInt(b["Card ID"] || "0", 10) || 0;
    return numA - numB;
  });

  return NextResponse.json(safeData);
}
