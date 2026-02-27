import { type NextRequest, NextResponse } from "next/server"
import { clearSession } from "@/lib/secure-session"


export async function POST(request: NextRequest) {
  await clearSession()

  const response = NextResponse.json({ success: true })

  response.cookies.delete("user")
  response.cookies.delete("vercel_auth_session")

  return response
}

export async function GET(request: NextRequest) {
  await clearSession()

  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin))

  response.cookies.delete("user")
  response.cookies.delete("vercel_auth_session")

  return response
}
