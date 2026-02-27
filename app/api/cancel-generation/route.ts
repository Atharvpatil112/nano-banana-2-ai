import { type NextRequest, NextResponse } from "next/server"
import { getRun } from "workflow/api"

export async function POST(request: NextRequest) {
  try {
    const { runId } = await request.json()

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 })
    }

    const run = getRun(runId)
    await run.cancel()

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[cancel-generation] Error:", message)
    // Don't fail — the workflow might already be done
    return NextResponse.json({ success: true })
  }
}
