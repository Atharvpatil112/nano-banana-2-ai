import { type NextRequest, NextResponse } from "next/server"
import { saveGeneration } from "@/lib/db/queries"
import { getCachedUserGenerations } from "@/lib/db/cached-queries"
import { validateUserOwnership, getAuthenticatedUserEmail } from "@/lib/auth-validation"
import { revalidateTag } from "next/cache"

async function verifyUserOwnership(request: NextRequest, email: string): Promise<boolean> {
  try {
    const userCookie = request.cookies.get("user")?.value
    if (!userCookie) return false

    const user = JSON.parse(userCookie)
    return user?.email === email
  } catch {
    return false
  }
}

// GET: Fetch user's generations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20", 10), 50)

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const isAuthorized = await validateUserOwnership(request, email)
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const generations = await getCachedUserGenerations(email, limit, offset)

    return NextResponse.json(
      { generations, hasMore: generations.length === limit },
    )
  } catch (error) {
    console.error("Error fetching generations:", error)
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}

// POST: Save a new generation or multiple generations
export async function POST(request: NextRequest) {
  try {
    const authenticatedEmail = await getAuthenticatedUserEmail(request)
    if (!authenticatedEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { generation, generations, email } = body

    if (email && email !== authenticatedEmail) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 })
    }

    if (generations && Array.isArray(generations)) {
      const savedGenerations = await Promise.all(
        generations.map((gen) => {
          const generationToSave = { ...gen, userEmail: authenticatedEmail }
          return saveGeneration(generationToSave)
        }),
      )

      revalidateTag(`generations-${authenticatedEmail}`)
      revalidateTag("generation-stats")
      return NextResponse.json({ generations: savedGenerations }, { status: 201 })
    }

    if (generation) {
      const generationToSave = { ...generation, userEmail: authenticatedEmail }
      const savedGeneration = await saveGeneration(generationToSave)

      revalidateTag(`generations-${authenticatedEmail}`)
      revalidateTag("generation-stats")
      return NextResponse.json({ generation: savedGeneration }, { status: 201 })
    }

    return NextResponse.json({ error: "Generation data required" }, { status: 400 })
  } catch (error) {
    console.error("Error saving generation:", error)
    return NextResponse.json({ error: "Failed to save generation" }, { status: 500 })
  }
}

// DELETE: Delete all generations for a user
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const isAuthorized = await validateUserOwnership(request, email)
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return NextResponse.json({ error: "Bulk delete not implemented" }, { status: 501 })
}
