import { NextResponse } from "next/server";
import { generateHMAC } from "@/lib/crypto";

// Use local worker URL for development
const QR_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8788/generate' 
  : 'https://b2uqr.qr4pos.com/generate';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.QR_SERVICE_API_KEY;
    const secret = process.env.QR_SERVICE_SECRET_KEY;

    if (!apiKey || !secret) {
      return NextResponse.json({ error: "QR Service configuration is missing on the server" }, { status: 500 });
    }

    const payload = await request.json();
    const payloadString = JSON.stringify(payload);

    // Generate HMAC signature for the outbound request
    const signature = generateHMAC(payloadString, secret);

    const response = await fetch(QR_API_URL, {
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

    const contentType = response.headers.get("content-type");
    let jsonData: any = null;
    let base64Image = "";

    if (contentType && contentType.includes("application/json")) {
      jsonData = await response.json();
      base64Image = jsonData.base64 || jsonData.image || jsonData.qr_code || JSON.stringify(jsonData);
      console.log("QR API Response parsed as JSON");
    } else {
      base64Image = await response.text();
      console.log("QR API Response parsed as text");
    }

    base64Image = base64Image.trim();
    
    // Remove surrounding quotes if present (sometimes returned by some APIs)
    if (base64Image.startsWith('"') && base64Image.endsWith('"')) {
      base64Image = base64Image.slice(1, -1);
    }

    // If it's still JSON-like (starts with {), try to extract base64 again
    if (base64Image.startsWith('{') && !jsonData) {
      try {
        jsonData = JSON.parse(base64Image);
        base64Image = jsonData.base64 || jsonData.image || jsonData.qr_code || base64Image;
      } catch (e) {
        // Not valid JSON
      }
    }

    const reference = jsonData?.reference || jsonData?.reference_number || jsonData?.reference_no || jsonData?.id || null;

    return NextResponse.json({
      image: base64Image,
      reference: reference,
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
