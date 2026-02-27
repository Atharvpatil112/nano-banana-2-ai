import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest, type SessionData } from "@/lib/secure-session"
import { getIronSession, type SessionOptions } from "iron-session"
import * as cookie from "cookie"

// Token response type matching what Vercel OAuth returns
interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

const SESSION_COOKIE_NAME = "vercel_auth_session"



function getSessionOptions(): SessionOptions {
  const sessionSecret = process.env.SESSION_SECRET || "default-secret-for-v0-preview-only-not-secure-32-chars-minimum"
  return {
    password: sessionSecret,
    cookieName: "vercel_auth_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    },
  }
}

/**
 * Refresh the access token using the refresh token.
 * This is only called from navigation requests (page loads), never from API calls,
 * so there's no risk of concurrent refresh attempts for the same token.
 */
async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID
  const clientSecret = process.env.VERCEL_OAUTH_CLIENT_SECRET

  if (!clientId || !refreshToken) {
    return null
  }

  try {
    // Use the correct Vercel OAuth token endpoint
    const tokenResponse = await fetch("https://api.vercel.com/login/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        ...(clientSecret && { client_secret: clientSecret }),
        refresh_token: refreshToken,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[proxy] Token refresh failed:", {
        status: tokenResponse.status,
        error: errorText,
      })
      return null
    }

    const tokens = await tokenResponse.json()
    console.log("[proxy] Token refresh API call successful", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
    })
    return tokens
  } catch (error) {
    console.error("[proxy] Token refresh error:", error)
    return null
  }
}

/**
 * Check if we need to refresh the token.
 * Refresh if token expires in less than 30 minutes.
 * This aggressive refresh ensures the session stays alive indefinitely
 * as long as the user visits the app at least once per hour.
 */
function needsTokenRefresh(session: SessionData): boolean {
  if (!session.isLoggedIn || !session.accessToken || !session.refreshToken) {
    return false
  }

  if (!session.expiresAt) {
    // No expiration info - refresh to be safe
    return true
  }

  // Refresh if less than 30 minutes remaining (half of the 1-hour token life)
  // This ensures the refresh token stays active with regular use
  const thirtyMinutesFromNow = Date.now() + 30 * 60 * 1000
  return session.expiresAt < thirtyMinutesFromNow
}

/**
 * Save session to response cookies
 */
async function saveSessionToResponse(response: NextResponse, session: SessionData): Promise<void> {
  const ironSession = await getIronSession<SessionData>(response.cookies as any, getSessionOptions())
  ironSession.email = session.email
  ironSession.name = session.name
  ironSession.picture = session.picture
  ironSession.accessToken = session.accessToken
  ironSession.refreshToken = session.refreshToken
  ironSession.expiresAt = session.expiresAt
  ironSession.isLoggedIn = session.isLoggedIn
  await ironSession.save()
}

/**
 * Check if this is a navigation request (page load) vs a client-side fetch (API call).
 * Token refresh should ONLY happen on navigation requests to avoid race conditions
 * where multiple concurrent API calls try to refresh the same single-use token.
 * 
 * Following Mark Roberts' recommendation: "the only safe approach i found was to
 * refresh tokens in one place and one place only: middleware" - and only on navigation.
 */
function isNavigationRequest(request: NextRequest): boolean {
  // force_refresh_access_token is always allowed (explicit user/debug action)
  if (request.nextUrl.searchParams.get("force_refresh_access_token") === "true") {
    return true
  }

  // API routes are never navigation - they're fetch calls from the client
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return false
  }

  // Check Sec-Fetch-Mode header: "navigate" = page load, "cors"/"same-origin" = fetch
  const fetchMode = request.headers.get("sec-fetch-mode")
  if (fetchMode === "navigate") {
    return true
  }

  // Check Sec-Fetch-Dest header: "document" = page load
  const fetchDest = request.headers.get("sec-fetch-dest")
  if (fetchDest === "document") {
    return true
  }

  // If no Sec-Fetch headers (old browsers), check Accept header
  const accept = request.headers.get("accept") || ""
  if (accept.includes("text/html")) {
    return true
  }

  return false
}

/**
 * Main proxy function - THE ONLY PLACE where token refresh happens.
 * Following Mark Roberts' recommendation: refresh tokens in middleware only,
 * and only on navigation requests (page loads), never on API/fetch calls.
 */
export async function proxy(request: NextRequest) {
  const isNavigation = isNavigationRequest(request)
  
  // Check for force refresh parameter (following Mark Roberts' pattern)
  const forceRefresh = request.nextUrl.searchParams.get("force_refresh_access_token") === "true"
  
  // Remove the force_refresh param from the URL to avoid passing it downstream
  if (forceRefresh) {
    request.nextUrl.searchParams.delete("force_refresh_access_token")
  }

  // Try to get session and check if refresh is needed
  let session: Awaited<ReturnType<typeof getSessionFromRequest>> | null = null
  let didRefresh = false

  try {
    session = await getSessionFromRequest(request)
    
    if (session?.isLoggedIn && session?.refreshToken && isNavigation) {
      const tokenNeedsRefresh = needsTokenRefresh(session)
      const shouldRefreshToken = forceRefresh || tokenNeedsRefresh
      
      if (shouldRefreshToken) {
        console.log("[proxy] Starting token refresh", {
          user: session.email,
          reason: forceRefresh ? "force_refresh" : "token_expiring_soon",
          expiresAt: session.expiresAt ? new Date(session.expiresAt).toISOString() : "unknown",
          timeUntilExpiry: session.expiresAt ? Math.round((session.expiresAt - Date.now()) / 1000) + "s" : "unknown",
        })
        
        const newTokens = await refreshAccessToken(session.refreshToken)
        
        if (!newTokens) {
          console.error("[proxy] Token refresh failed - no new tokens returned", {
            user: session.email,
          })
          // Don't log the user out immediately - let them continue with the existing token
          // The token might still work for a bit, and we'll try again on the next request
        } else {
          // Update session with new tokens
          session.accessToken = newTokens.access_token
          if (newTokens.refresh_token) {
            session.refreshToken = newTokens.refresh_token
          }
          session.expiresAt = Date.now() + newTokens.expires_in * 1000
          didRefresh = true
          console.log("[proxy] Token refreshed successfully", {
            user: session.email,
            newExpiresAt: new Date(session.expiresAt).toISOString(),
          })
        }
      }
    }
  } catch (error) {
    // Session errors shouldn't block the request
    console.error("[proxy] Session error:", error)
  }

  // Following Mark Roberts' pattern: when tokens are refreshed, ALWAYS redirect
  // back to the same URL. This ensures the browser receives and stores the updated
  // session cookie BEFORE making any fetch/API calls. Without the redirect, the
  // browser might start firing API requests with the old cookie before processing
  // the Set-Cookie header from NextResponse.next().
  if (didRefresh && session) {
    const response = NextResponse.redirect(request.nextUrl, { status: 302 })
    await saveSessionToResponse(response, session)

    // Following Mark Roberts' pattern from vercel/ai-studio:
    // After saving the session to the response, we also need to propagate the updated
    // session cookie into the request's Cookie header so the backend can read it.
    // Steps:
    // 1. Extract the request's Cookie header
    // 2. Merge the updated session cookie into it
    // 3. Copy the merged Cookie header into the response's headers
    const updatedCookieValue = response.cookies.get(SESSION_COOKIE_NAME)?.value
    if (updatedCookieValue) {
      const reqCookieHeader = request.headers.get("cookie")
      const reqCookies = reqCookieHeader ? cookie.parse(reqCookieHeader) : {}
      reqCookies[SESSION_COOKIE_NAME] = updatedCookieValue

      const resCookies: string[] = []
      for (const [key, value] of Object.entries(reqCookies)) {
        resCookies.push(cookie.serialize(key, value))
      }
      const resCookieHeader = resCookies.join(", ")

      response.headers.set("Cookie", resCookieHeader)
    }

    return response
  }

  const response = NextResponse.next({ request })

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self' data: blob:; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data: https://vercel.live; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " +
      "style-src 'self' 'unsafe-inline'; " +
      "connect-src 'self' data: blob: https:; " +
      "frame-src 'self' https://vercel.live; " +
      "worker-src 'self' blob:; " +
      "object-src 'none'; " +
      "base-uri 'self';",
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|\\.well-known/workflow/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
