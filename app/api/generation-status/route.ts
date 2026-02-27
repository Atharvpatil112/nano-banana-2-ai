import { type NextRequest, NextResponse } from "next/server"
import { getRun } from "workflow/api"


export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId")

  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 })
  }

  try {
    const run = getRun(runId)
    const status = await run.status

    if (status === "completed") {
      const result = await run.returnValue
      return NextResponse.json({
        status: "completed",
        result,
      })
    }

    if (status === "failed" || status === "cancelled") {
      return NextResponse.json({
        status: "failed",
        error: "Generation failed",
      })
    }

    // pending or running — return startedAt so client can compute real progress
    const startedAt = await run.startedAt
    return NextResponse.json({
      status: "running",
      startedAt: startedAt?.toISOString() || null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[generation-status] Error getting run:", message, error)
    return NextResponse.json(
      { error: "Failed to check generation status", details: message },
      { status: 500 },
    )
  }
}
