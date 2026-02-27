import { NextResponse } from "next/server"
import { getSession } from "@/lib/secure-session"

/**
 * Debug endpoint for testing session and token refresh behavior.
 * 
 * TEST FLOW (3 steps):
 * 
 * Step 1: GET /api/auth/debug
 *   - Shows current session state (should be logged in with valid tokens)
 * 
 * Step 2: GET /api/auth/debug?poison=true
 *   - Sets expiresAt to 5 days ago, simulating a user who hasn't visited in 5 days
 *   - Does NOT invalidate the refresh_token (it's still valid for 30 days)
 *   - Redirects to the HOME PAGE (/) which is a navigation request
 *   - The middleware sees the expired token and refreshes it via 302 redirect
 *   - After the home page loads, go to Step 3 manually
 * 
 * Step 3: GET /api/auth/debug?verify=true
 *   - Checks if the token was successfully refreshed
 *   - Shows PASS if expiresAt is now in the future (middleware refreshed it)
 *   - Shows FAIL if expiresAt is still in the past
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const poison = url.searchParams.get("poison") === "true"
  const verify = url.searchParams.get("verify") === "true"

  const session = await getSession()

  if (!session?.isLoggedIn || !session?.email) {
    return NextResponse.json({
      status: "NOT_LOGGED_IN",
      message: "Log in first, then run this test.",
    })
  }

  // STEP 2: Poison the session - set expiresAt to 5 days ago
  if (poison) {
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000

    const originalExpiresAt = session.expiresAt
    session.expiresAt = fiveDaysAgo
    await session.save()

    console.log("[debug] POISONED session for test", {
      user: session.email,
      originalExpiresAt: new Date(originalExpiresAt).toISOString(),
      poisonedExpiresAt: new Date(fiveDaysAgo).toISOString(),
      refreshTokenStillValid: !!session.refreshToken,
    })

    // Redirect to the HOME PAGE - this is a real NAVIGATION request.
    // The middleware will see expiresAt is 5 days in the past, refresh the token,
    // and 302 redirect with the updated cookie. The user sees the home page load normally.
    // After the page loads, go to /api/auth/debug?verify=true to confirm it worked.
    return NextResponse.redirect(new URL("/", url.origin))
  }

  // STEP 3: Verify - did the middleware refresh the token before we got here?
  if (verify) {
    const now = Date.now()
    const expiresAt = session.expiresAt || 0
    const tokenIsFresh = expiresAt > now
    const tokenExpiresInMinutes = Math.round((expiresAt - now) / 60000)

    const passed = tokenIsFresh && !!session.accessToken && !!session.email

    return NextResponse.json({
      test: "SIMULATE_5_DAYS_INACTIVE",
      result: passed ? "PASS" : "FAIL",
      explanation: passed
        ? "Middleware detected expired token, refreshed it via 302 redirect, user stays logged in."
        : "Token was NOT refreshed. User would appear broken.",
      session: {
        email: session.email,
        isLoggedIn: session.isLoggedIn,
        tokenIsFresh,
        expiresAt: new Date(expiresAt).toISOString(),
        expiresInMinutes: tokenExpiresInMinutes,
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
      },
    })
  }

  // STEP 1: Show current session state
  const now = Date.now()
  const expiresAt = session.expiresAt || 0
  const timeUntilExpiry = expiresAt - now

  return NextResponse.json({
    status: "LOGGED_IN",
    user: session.email,
    token: {
      expiresAt: new Date(expiresAt).toISOString(),
      expiresInMinutes: Math.round(timeUntilExpiry / 60000),
      isExpired: timeUntilExpiry < 0,
      hasRefreshToken: !!session.refreshToken,
    },
    test: {
      step1: "You are here. Session looks good.",
      step2: "Go to /api/auth/debug?poison=true to simulate 5 days of inactivity. It will redirect you to the home page.",
      step3: "After the home page loads normally (you should still be logged in), go to /api/auth/debug?verify=true to confirm the token was refreshed.",
    },
  })
}
