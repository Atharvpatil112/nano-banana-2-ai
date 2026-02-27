import { type NextRequest, NextResponse } from "next/server"
import { generateCodeVerifier, generateCodeChallenge, generateState, getAuthorizationUrl } from "@/lib/auth"


export async function GET(request: NextRequest) {
  // Check if we need to force consent screen (e.g., user needs to grant team permissions)
  const forceConsent = request.nextUrl.searchParams.get("reauth") === "true"

  // Get client ID from environment
  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "OAuth client not configured" }, { status: 500 })
  }

  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateState()
  const nonce = generateState()

  // Build redirect URI
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`

  // Build authorization URL
  const authUrl = getAuthorizationUrl({
    clientId,
    redirectUri,
    scope: "openid profile email offline_access",
    state,
    codeChallenge,
    nonce,
    forceConsent,
  })

  // Create response with redirect
  const response = NextResponse.redirect(authUrl)

  // Store PKCE parameters in HTTP-only cookies
  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  })

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  response.cookies.set("oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}
