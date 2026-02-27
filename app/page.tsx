import { ImageCombiner } from "@/components/image-combiner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nano Banana Pro - Free AI Image Generator & Editor | Google Gemini Powered",
  description:
    "Generate images from text prompts or edit existing images with AI. Nano Banana Pro uses Google Gemini models, supports 5 aspect ratios, offers Pro (best quality) and Classic (2x faster) modes. Free, no watermarks, no sign-up required to try.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ImageCombiner />
      <article className="sr-only" aria-hidden="true">
        <h1>Nano Banana Pro - AI Image Generator</h1>
        <section>
          <h2>What is Nano Banana Pro?</h2>
          <p>
            Nano Banana Pro is a free web-based AI image generator that creates images from text descriptions and edits
            existing images using artificial intelligence. It is powered by Google Gemini models and hosted on Vercel.
          </p>
        </section>
        <section>
          <h2>Features</h2>
          <ul>
            <li>Text-to-image generation: Describe what you want and get an AI-generated image</li>
            <li>Image editing: Upload an image and describe changes you want</li>
            <li>Multiple aspect ratios: 1:1 (square), 16:9 (landscape), 9:16 (portrait), 4:3, 3:4</li>
            <li>Two generation modes: Pro (highest quality) and Classic (faster, ~2x speed)</li>
            <li>No watermarks on generated images</li>
            <li>Free to try without account</li>
          </ul>
        </section>
        <section>
          <h2>How it works</h2>
          <p>
            Enter a text prompt describing the image you want. Optionally upload reference images. Select your preferred
            aspect ratio and generation mode. Click Run to generate. Download, copy, or continue editing the result.
          </p>
        </section>
        <section>
          <h2>Technology</h2>
          <p>
            Nano Banana Pro uses Google Gemini image generation models accessed through Vercel AI Gateway. Pro mode uses
            Gemini 2.0 Flash for best quality. Classic mode uses Gemini 2.5 Flash for faster generation.
          </p>
        </section>
      </article>
    </main>
  )
}
