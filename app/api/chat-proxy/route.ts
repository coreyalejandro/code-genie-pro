import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_CHAT_URL = process.env.EXTERNAL_CHAT_URL || 
  "https://a93f2212-32d7-4de9-8dc5-71f34c2efc0c.preview.emergentagent.com/chat";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy the request to the external chat API
    const response = await fetch(EXTERNAL_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers for the external API
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External chat API error:", errorText);
      return NextResponse.json(
        { error: "External chat API request failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

