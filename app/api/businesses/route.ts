import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { companyName, address, phone, placeId } = body;

  if (!companyName || !address || !phone) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const newBusiness = {
    id: crypto.randomUUID(),
    companyName,
    address,
    phone,
    placeId: placeId || "",
    createdAt: new Date().toISOString(),
    reviewStats: {
      total: 0,
      average: 0,
      distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    },
  };

  const { error } = await supabase.from("businesses").insert(newBusiness);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(newBusiness, { status: 201 });
}
