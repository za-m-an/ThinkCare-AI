import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const slmApiUrl = process.env.NEXT_PUBLIC_SLM_API_URL || "http://127.0.0.1:11434";

    try {
      const response = await fetch(`${slmApiUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 seconds timeout
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `Ollama returned status ${response.status}: ${response.statusText}`,
        });
      }

      const data = await response.json();
      const modelsList = data.models || [];
      const modelNames = modelsList.map((m: any) => m.name);
      
      const foundModel = modelNames.some((name: string) => 
        name === "thinkcare-slm" || name.includes("thinkcare-slm")
      );

      return NextResponse.json({
        success: true,
        url: slmApiUrl,
        models: modelNames,
        foundModel: foundModel
      });
    } catch (fetchErr: any) {
      console.warn("Failed to connect to Ollama server at", slmApiUrl, fetchErr);
      return NextResponse.json({
        success: false,
        url: slmApiUrl,
        error: fetchErr.message || "Connection timed out / refused",
      });
    }
  } catch (error: any) {
    console.error("Test Ollama API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
