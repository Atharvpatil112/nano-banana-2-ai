import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/secure-session"


export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session.isLoggedIn || !session.email) {
      return NextResponse.json({ user: null })
    }

    // The session cookie is encrypted and tamper-proof (iron-session).
    // If isLoggedIn is true and email exists, the user is authenticated.
    // Token refresh is handled exclusively by the proxy/middleware.
    // We do NOT check expiresAt here because:
    // 1. The proxy refreshes tokens proactively (before they expire)
    // 2. If the token just expired and the proxy hasn't refreshed yet,
    //    returning user:null would flash the user as logged out
    // 3. expiresAt refers to the access_token, not the user's session

    return NextResponse.json({
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
    })
  } catch (error) {
    console.error("Error fetching user session:", error)
    return NextResponse.json({ user: null })
  }
}
