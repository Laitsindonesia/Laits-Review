import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `https://places.googleapis.com/v1/places:autocomplete`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input,
        languageCode: "id",
        locationBias: {
          circle: {
            center: { latitude: -6.2088, longitude: 106.8456 },
            radius: 50000.0,
          },
        },
      }),
    });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { predictions: [], error: data.error.message, details: data.error },
      );
    }

    const predictions = (data.suggestions || []).map(
      (item: {
        placePrediction?: {
          placeId: string;
          text?: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }) => {
        const p = item.placePrediction;
        if (!p) return null;
        return {
          description: p.text?.text || "",
          place_id: p.placeId,
          main_text: p.structuredFormat?.mainText?.text || p.text?.text || "",
          secondary_text: p.structuredFormat?.secondaryText?.text || "",
        };
      }
    ).filter(Boolean);

    return NextResponse.json({ predictions, status: "OK" });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch places data", predictions: [] },
      { status: 500 }
    );
  }
}
