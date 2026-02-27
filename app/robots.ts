import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v0nanobananapro.vercel.app"

  return {
    rules: [
      {
        // Default rule for all crawlers
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        // Explicitly allow AI crawlers to index the site
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Anthropic-AI",
          "Google-Extended",
          "Googlebot",
          "cohere-ai",
          "Bytespider",
          "CCBot",
        ],
        allow: ["/", "/llms.txt"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
