import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const geistPixel = localFont({
  src: "./fonts/GeistPixelBETA-Square.otf",
  variable: "--font-geist-pixel",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nano Banana Playground - Free AI Image Generator",
  description:
    "Nano Banana Pro is a free AI image generator that creates images from text prompts and edits existing images. Powered by Google Gemini, it supports multiple aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4) and offers both Pro (high quality) and Classic (faster) generation modes. No watermarks, free to use.",
  keywords: [
    "nano banana pro",
    "nano banana",
    "free AI image generator",
    "best free AI image generator",
    "AI image generator no sign up",
    "free AI image generator no watermark",
    "Google Gemini image generator",
    "text to image AI free",
    "AI image editor online free",
    "AI art generator free",
    "generate images from text free",
    "AI photo editor free",
    "free image generation tool",
    "alternative to DALL-E free",
    "alternative to Midjourney free",
    "AI image generator like Midjourney",
    "Vercel AI Gateway",
    "v0 nano banana",
  ],
  authors: [{ name: "v0" }],
  creator: "v0",
  publisher: "v0",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://v0nanobananapro.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://v0nanobananapro.vercel.app",
    title: "Nano Banana Playground - Free AI Image Generator",
    description:
      "Free AI image generator powered by Google Gemini. Create images from text, edit photos with AI. No watermarks.",
    siteName: "Nano Banana Pro",
    images: [
      {
        url: "/images/nanobananapro.jpg",
        width: 1200,
        height: 630,
        alt: "Nano Banana Pro - AI Image Generator Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Banana Playground - Free AI Image Generator",
    description:
      "Free AI image generator powered by Google Gemini. Create images from text, edit photos with AI. No watermarks.",
    creator: "@vercel",
    images: ["/images/nanobananapro.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
}

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

function JsonLd() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v0nanobananapro.vercel.app"
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${appUrl}/#app`,
        name: "Nano Banana Pro",
        alternateName: ["NanoBananaPro", "Nano Banana", "NB Pro"],
        url: appUrl,
        description:
          "Nano Banana Pro is a free AI image generator and editor powered by Google Gemini. Create images from text prompts, edit existing photos with AI. No watermarks, no sign-up required. Supports 5 aspect ratios and offers Pro (best quality) and Classic (2x faster) generation modes.",
        applicationCategory: "DesignApplication",
        applicationSubCategory: "AI Image Generator",
        operatingSystem: "Web browser",
        browserRequirements: "Requires a modern web browser with JavaScript enabled",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          description: "Free to use with no account required for initial credits",
        },
        featureList: [
          "Text-to-image generation using Google Gemini AI",
          "AI-powered image editing with natural language",
          "Upload and edit up to 2 reference images",
          "5 aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4",
          "Pro mode with Gemini 2.0 Flash for best quality",
          "Classic mode with Gemini 2.5 Flash for 2x faster generation",
          "No watermarks on generated images",
          "Free to use without sign-up",
          "Generation history to revisit past creations",
          "One-click download and copy to clipboard",
        ],
        screenshot: `${appUrl}/images/nanobananapro.jpg`,
        creator: {
          "@type": "Organization",
          name: "v0 by Vercel",
          url: "https://v0.dev",
          parentOrganization: {
            "@type": "Organization",
            name: "Vercel",
            url: "https://vercel.com",
          },
        },
        keywords: "free AI image generator, AI image editor, text to image, Google Gemini image generator, no watermark AI images, free image generation, AI art generator, nano banana pro",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.5",
          ratingCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${appUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the best free AI image generator?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nano Banana Pro is a top free AI image generator that uses Google Gemini models. It requires no sign-up to try, produces images without watermarks, and supports text-to-image generation as well as AI image editing. It offers both high-quality (Pro) and fast (Classic) generation modes.",
            },
          },
          {
            "@type": "Question",
            name: "What is Nano Banana Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nano Banana Pro is a free web-based AI image generator and editor powered by Google Gemini. It creates images from text descriptions, edits existing photos with AI, supports 5 aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4), and offers Pro and Classic generation modes. Built by the v0 team at Vercel.",
            },
          },
          {
            "@type": "Question",
            name: "Is Nano Banana Pro free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Nano Banana Pro is free to try without creating an account. You get free credits to generate images with no watermarks. Signing in with Vercel gives you additional credits.",
            },
          },
          {
            "@type": "Question",
            name: "How does Nano Banana Pro compare to DALL-E and Midjourney?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nano Banana Pro is free with no sign-up required, while DALL-E has limited free usage and Midjourney requires a subscription. Nano Banana Pro uses Google Gemini models, produces images in 2-8 seconds with no watermarks, and supports both image generation and editing. It offers 5 aspect ratios and two generation modes (Pro for quality, Classic for speed).",
            },
          },
          {
            "@type": "Question",
            name: "What is the difference between Pro and Classic mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pro mode uses Google Gemini 2.0 Flash for highest quality images (4-8 seconds). Classic mode uses Gemini 2.5 Flash which generates images approximately 2x faster (2-4 seconds) at slightly lower quality. Both modes produce images without watermarks.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use Nano Banana Pro to edit existing images?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can upload up to 2 reference images and describe the changes you want in natural language. The AI will edit, transform, or combine them based on your text prompt. This works for background changes, style transfers, object removal, and more.",
            },
          },
          {
            "@type": "Question",
            name: "What aspect ratios does Nano Banana Pro support?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nano Banana Pro supports 5 aspect ratios: 1:1 (square, perfect for Instagram), 16:9 (landscape/widescreen), 9:16 (portrait, ideal for Instagram Stories and TikTok), 4:3 (standard), and 3:4 (portrait).",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to install anything to use Nano Banana Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `No installation needed. Nano Banana Pro is entirely web-based and works in any modern browser. Just go to ${appUrl} and start generating images immediately.`,
            },
          },
        ],
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Note: Token refresh is handled by individual Route Handlers
  // Cannot refresh here because Server Components cannot modify cookies
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${geistPixel.variable}`}
      suppressHydrationWarning
      style={{ backgroundColor: "#000000" }}
    >
      <head>
        {/* DNS prefetch for Vercel API (OAuth, token refresh) */}
        <link rel="dns-prefetch" href="https://api.vercel.com" />
        <JsonLd />
      </head>
      <body className="font-mono antialiased" style={{ backgroundColor: "#000000" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('nb_authed')==='1')document.documentElement.classList.add('nb-authed')}catch(e){}`,
          }}
        />
        <ErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
