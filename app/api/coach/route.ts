import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.session_id || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: session_id and message are required" },
        { status: 400 }
      );
    }

    // Proxy the request to the FastAPI backend /api/chat endpoint
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      
      // Return more detailed error information
      return NextResponse.json(
        { 
          error: "Backend request failed", 
          details: errorText,
          status: response.status,
          backend_url: BACKEND_URL
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Coach API error:", error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error: "Cannot connect to backend",
          details: `Failed to connect to ${BACKEND_URL}. Is the backend running?`,
          backend_url: BACKEND_URL
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

