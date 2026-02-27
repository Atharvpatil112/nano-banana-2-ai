import { type NextRequest, NextResponse } from "next/server"
import { start } from "workflow/api"
import { generateImageWorkflow, type GenerateImageInput } from "@/workflows/generate-image"
import { getSession } from "@/lib/secure-session"
import { checkUsageLimit, getRateLimitHeaders, type UsageLimitResult } from "@/lib/usage"
import type { ModelType, ThinkingLevel, Resolution } from "@/components/image-combiner/types"

export const maxDuration = 120

const MAX_PROMPT_LENGTH = 5000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const FETCH_TIMEOUT_MS = 15_000

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    return parsed.hostname.endsWith(".public.blob.vercel-storage.com") ||
      parsed.hostname.endsWith(".googleusercontent.com") ||
      parsed.hostname === "generativelanguage.googleapis.com"
  } catch {
    return false
  }
}

interface ErrorResponse {
  error: string
  message?: string
  details?: string
  resetTime?: number
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

    let userEmail: string | null = null

    const session = await getSession()
    userEmail = session?.email || null

    const isAuthenticated = !!session?.accessToken

    // Track usage for anonymous users (informational only, does not block)
    let usage: UsageLimitResult | null = null
    if (!isAuthenticated) {
      try {
        usage = await checkUsageLimit(ip)
      } catch {
        // Usage tracking is best-effort; don't block generation
      }
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json<ErrorResponse>(
        { error: "Configuration error", details: "AI_GATEWAY_API_KEY is not configured." },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await request.formData()
    const mode = formData.get("mode") as string
    const prompt = formData.get("prompt") as string
    const aspectRatio = formData.get("aspectRatio") as string
    const selectedModel = (formData.get("selectedModel") as ModelType) || "nb2"
    const thinkingLevel = (formData.get("thinkingLevel") as ThinkingLevel) || "minimal"
    const resolution = (formData.get("resolution") as Resolution) || "1K"
    const useGrounding = formData.get("useGrounding") === "true"

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json<ErrorResponse>({ error: "A prompt is required" }, { status: 400 })
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json<ErrorResponse>(
        { error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` },
        { status: 400 },
      )
    }

    // Convert images to data URLs for serialization into the workflow
    let image1DataUrl: string | undefined
    let image2DataUrl: string | undefined

    if (mode === "image-editing") {
      const image1 = formData.get("image1") as File
      const image2 = formData.get("image2") as File
      const image1Url = formData.get("image1Url") as string
      const image2Url = formData.get("image2Url") as string

      const hasImage1 = image1 || image1Url
      const hasImage2 = image2 || image2Url

      if (!hasImage1) {
        return NextResponse.json<ErrorResponse>(
          { error: "At least one image is required for editing mode" },
          { status: 400 },
        )
      }

      if (image1Url && !isAllowedImageUrl(image1Url)) {
        return NextResponse.json<ErrorResponse>(
          { error: "Invalid image URL. Only HTTPS URLs from allowed domains are accepted." },
          { status: 400 },
        )
      }
      if (image2Url && !isAllowedImageUrl(image2Url)) {
        return NextResponse.json<ErrorResponse>(
          { error: "Invalid image URL. Only HTTPS URLs from allowed domains are accepted." },
          { status: 400 },
        )
      }

      if (image1 && image1.size > MAX_FILE_SIZE) {
        return NextResponse.json<ErrorResponse>(
          { error: `Image 1 too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.` },
          { status: 400 },
        )
      }
      if (image2 && image2.size > MAX_FILE_SIZE) {
        return NextResponse.json<ErrorResponse>(
          { error: `Image 2 too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.` },
          { status: 400 },
        )
      }

      const convertToDataUrl = async (source: File | string): Promise<string> => {
        if (typeof source === "string") {
          const response = await fetch(source, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const base64 = buffer.toString("base64")
          const contentType = response.headers.get("content-type") || "image/jpeg"
          return `data:${contentType};base64,${base64}`
        } else {
          const arrayBuffer = await source.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const base64 = buffer.toString("base64")
          return `data:${source.type};base64,${base64}`
        }
      }

      if (hasImage1) {
        image1DataUrl = await convertToDataUrl(image1 || image1Url)
      }
      if (hasImage2) {
        image2DataUrl = await convertToDataUrl(image2 || image2Url)
      }
    }

    // Start the durable workflow
    const workflowInput: GenerateImageInput = {
      mode: mode as "text-to-image" | "image-editing",
      prompt,
      aspectRatio,
      selectedModel,
      thinkingLevel,
      resolution,
      useGrounding,
      apiKey,
      userEmail,
      ip,
      image1DataUrl,
      image2DataUrl,
    }

    const run = await start(generateImageWorkflow, [workflowInput])

    return NextResponse.json(
      { runId: run.runId },
      { headers: usage != null ? getRateLimitHeaders(usage) : undefined },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("[generate-image] Error starting workflow:", errorMessage)

    return NextResponse.json<ErrorResponse>(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
