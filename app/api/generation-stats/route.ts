import { NextResponse } from "next/server"
import { getCachedGenerationStats } from "@/lib/db/cached-queries"

export async function GET() {
  try {
    const stats = await getCachedGenerationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[generation-stats] Error:", error)
    return NextResponse.json({ medianDurationMs: null, sampleCount: 0 }, { status: 500 })
  }
}
