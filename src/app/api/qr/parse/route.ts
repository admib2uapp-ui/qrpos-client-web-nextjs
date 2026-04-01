import { NextResponse } from "next/server";
import { generateHMAC } from "@/lib/crypto";

// Use local worker URL for development
const QR_PARSE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8788/parse' 
  : 'https://b2uqr.qr4pos.com/parse';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.QR_SERVICE_API_KEY;
    const secret = process.env.QR_SERVICE_SECRET_KEY;

    if (!apiKey || !secret) {
      return NextResponse.json({ error: "QR Service configuration is missing on the server" }, { status: 500 });
    }

    const body = await request.json();
    const { payload } = body;

    if (!payload) {
      return NextResponse.json({ error: "QR payload is required" }, { status: 400 });
    }

    const payloadString = JSON.stringify({ payload, full_details: true, no_kv: true });

    // Generate HMAC signature for the outbound request
    const signature = generateHMAC(payloadString, secret);

    const response = await fetch(QR_PARSE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "x-signature": signature
      },
      body: payloadString,
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
