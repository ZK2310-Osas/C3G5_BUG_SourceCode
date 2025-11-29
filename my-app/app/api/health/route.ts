import { NextResponse } from "next/server";
import OpenAI from "openai";

// Convert place name → lat / lon
async function geocodeLocation(location: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    location
  )}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "HealthyTripAdvisor/1.0" },
  });

  const data = await res.json();
  if (!data[0]) throw new Error("Location not found");

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const location = url.searchParams.get("location");
  const question = url.searchParams.get("question");

  if (!location) {
    return NextResponse.json(
      { error: "location name is required." },
      { status: 400 }
    );
  }

  const aqicnToken = process.env.AQICN_TOKEN;
  const tomtomKey = process.env.TOMTOM_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!aqicnToken || !tomtomKey || !openaiKey) {
    return NextResponse.json({ error: "API keys missing." }, { status: 500 });
  }

  try {
    //
    // STEP 1 — Convert location name → lat/lon
    //
    const { lat, lon } = await geocodeLocation(location);

    //
    // STEP 2 — Fetch AQI
    //
    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${aqicnToken}`
    );
    const aqiData = await aqiRes.json();
    const aqi =
      aqiData?.status === "ok"
        ? Number(aqiData.data?.aqi) || null
        : null;

    //
    // STEP 3 — Fetch TomTom Traffic
    //
    const flowRes = await fetch(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${tomtomKey}&point=${lat},${lon}`
    );
    const flowData = await flowRes.json();
    const flowSegment = flowData?.flowSegmentData;

    const currentSpeed = flowSegment?.currentSpeed;
    const freeFlowSpeed = flowSegment?.freeFlowSpeed;

    let congestionPercent: number | null = null;
    if (currentSpeed && freeFlowSpeed && freeFlowSpeed > 0) {
      const ratio = currentSpeed / freeFlowSpeed;
      congestionPercent =
        ratio >= 1 ? 0 : Math.min(100, Math.max(0, (1 - ratio) * 100));
    }

    //
    // STEP 4 — Calculate weighted health score
    //
    const pollutionHealth =
      aqi !== null ? Math.max(0, 100 - (Math.min(aqi, 500) / 500) * 100) : null;

    const trafficHealth =
      congestionPercent !== null
        ? Math.max(0, 100 - congestionPercent)
        : null;

    const overallHealth =
      pollutionHealth !== null && trafficHealth !== null
        ? 0.6 * pollutionHealth + 0.4 * trafficHealth
        : pollutionHealth ?? trafficHealth ?? null;

    //
    // STEP 5 — Categorize result
    //
    let level = "No data";
    let advice = "Insufficient data.";
    let suitable = false;

    if (overallHealth !== null) {
      if (overallHealth >= 70) {
        level = "Good";
        advice = "Safe for all.";
        suitable = true;
      } else if (overallHealth >= 50) {
        level = "Moderate";
        advice = "OK, but sensitive groups should be careful.";
        suitable = true;
      } else if (overallHealth >= 30) {
        level = "Unhealthy for sensitive groups";
        advice = "Sensitive people should limit outdoor activity.";
        suitable = true;
      } else {
        level = "Very unhealthy";
        advice = "Not suitable for vulnerable individuals.";
        suitable = false;
      }
    }

    //
    // STEP 6 — Optional AI advice
    //
    let aiAdvice: string | null = null;
    if (question) {
      const client = new OpenAI({ apiKey: openaiKey });
      const prompt = `User asked: "${question}". 
AQI: ${aqi}, Traffic: ${congestionPercent}%, Health Score: ${overallHealth}. 
Give a short, safe advice.`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      aiAdvice = response.choices?.[0]?.message?.content ?? null;
    }

    return NextResponse.json({
      location,
      lat,
      lon,
      aqi,
      congestionPercent,
      pollutionHealth,
      trafficHealth,
      overallHealth,
      level,
      advice,
      suitable,
      aiAdvice,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to compute health score." },
      { status: 500 }
    );
  }
}
