import { type NextRequest, NextResponse } from "next/server"
import { getUsage } from "@/lib/usage"


export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"
    
    const usage = await getUsage(ip)
    
    return NextResponse.json(usage)
  } catch (error) {
    console.error("Error getting usage:", error)
    
    return NextResponse.json(
      {
        error: "Failed to get usage",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
