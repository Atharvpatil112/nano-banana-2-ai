import { type NextRequest, NextResponse } from "next/server"


/**
 * DEPRECATED: Token refresh is now handled ONLY by the proxy/middleware.
 * 
 * Following Mark Roberts' recommendation:
 * "The only 'safe' approach I found was to refresh tokens in ONE place and ONE place only: middleware."
 * 
 * This endpoint is kept for backwards compatibility but no longer performs refresh.
 * The proxy.ts middleware handles all token refresh automatically.
 * 
 * If you need to force a refresh, use: ?force_refresh_access_token=true on any URL
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      success: true, 
      message: "Token refresh is now handled by middleware. No action needed.",
      hint: "To force refresh, add ?force_refresh_access_token=true to any URL"
    }, 
    { status: 200 }
  )
}
