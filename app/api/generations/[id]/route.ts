import { NextRequest, NextResponse } from "next/server"
import { deleteGeneration } from "@/lib/db/queries"
import { validateUserOwnership } from "@/lib/auth-validation"
import { revalidateTag } from "next/cache"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const isAuthorized = await validateUserOwnership(request, email)
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteGeneration(id, email)
    revalidateTag(`generations-${email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete generation:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to delete generation", details: errorMessage }, { status: 500 })
  }
}
