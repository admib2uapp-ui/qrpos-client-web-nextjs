import { NextResponse } from "next/server";

const QR_PARSE_URL = 'https://b2uqr.qr4pos.com/parse';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.QR_SERVICE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "QR Service API Key is not configured on the server" }, { status: 500 });
    }

    const { payload } = await request.json();

    if (!payload) {
      return NextResponse.json({ error: "QR payload is required" }, { status: 400 });
    }

    const response = await fetch(QR_PARSE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload, full_details: true, no_kv: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `External API error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("QR Parse API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
