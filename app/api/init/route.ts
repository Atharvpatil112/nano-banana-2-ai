import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/secure-session"
import { getUsage } from "@/lib/usage"


/**
 * Combined initialization endpoint that returns auth + usage data in a single request.
 * This replaces two separate calls (/api/auth/me + /api/usage) on page load,
 * reducing network round-trips and cutting initial load time.
 */
export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Run auth check and usage lookup in parallel
    const [session, usage] = await Promise.all([
      getSession().catch(() => null),
      getUsage(ip).catch(() => ({
        allowed: true,
        remaining: 0,
        resetTime: 0,
      })),
    ])

    const user =
      session?.isLoggedIn && session?.email
        ? {
            email: session.email,
            name: session.name,
            picture: session.picture,
          }
        : null

    const authConfigured = !!(process.env.VERCEL_OAUTH_CLIENT_ID && process.env.VERCEL_OAUTH_CLIENT_SECRET)
    const aiConfigured = !!process.env.AI_GATEWAY_API_KEY
    const dbConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN

    return NextResponse.json({
      user,
      usage,
      authConfigured,
      aiConfigured,
      dbConfigured,
      blobConfigured,
    })
  } catch (error) {
    console.error("[init] Error:", error)
    return NextResponse.json({
      user: null,
      usage: { allowed: true, remaining: 0, resetTime: 0 },
      authConfigured: false,
      aiConfigured: false,
      dbConfigured: false,
      blobConfigured: false,
    })
  }
}
