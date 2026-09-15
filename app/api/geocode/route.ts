import { NextResponse } from "next/server";

const API_KEY = process.env.DISTANCEMATRIX_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key tidak dikonfigurasi", results: [] },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.distancematrix.ai/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}&language=id`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json({ results: [], status: data.status });
    }

    const results = (data.result || data.results || []).map(
      (item: {
        formatted_address: string;
        geometry?: { location?: { lat: number; lng: number } };
        place_id?: string;
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      }) => ({
        formatted_address: item.formatted_address,
        lat: item.geometry?.location?.lat,
        lng: item.geometry?.location?.lng,
        place_id: item.place_id || "",
        address_components: item.address_components || [],
      })
    );

    return NextResponse.json({ results, status: "OK" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch geocode data", results: [] },
      { status: 500 }
    );
  }
}
