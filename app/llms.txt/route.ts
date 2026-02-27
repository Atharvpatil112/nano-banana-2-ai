export function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v0nanobananapro.vercel.app"
  const content = `# Nano Banana Pro

> Nano Banana Pro is a free AI image generator and editor powered by Google Gemini. It creates images from text prompts and edits existing photos. No watermarks, no sign-up required to try. Available at ${appUrl}

## About

Nano Banana Pro is a web-based AI image generation tool built on Vercel using Google Gemini models through the Vercel AI Gateway. It is designed for anyone who needs to quickly generate or edit images using natural language descriptions.

Key facts:
- Free to use with no account required for initial credits
- No watermarks on any generated images
- Supports text-to-image generation and AI image editing
- Built with Next.js and deployed on Vercel
- Created by the v0 team at Vercel

## Features

- **Text-to-Image Generation**: Describe any image in natural language and get a high-quality AI-generated result
- **AI Image Editing**: Upload up to 2 reference images and describe the changes you want
- **Multiple Aspect Ratios**: 1:1 (square), 16:9 (landscape/widescreen), 9:16 (portrait/stories/reels), 4:3 (standard), 3:4 (portrait)
- **Two Generation Modes**:
  - Pro Mode: Uses Google Gemini 2.0 Flash for highest quality output
  - Classic Mode: Uses Google Gemini 2.5 Flash for approximately 2x faster generation
- **Generation History**: Browse and revisit all previously generated images
- **Download & Copy**: Save generated images or copy them directly to clipboard

## Comparison with Other AI Image Generators

| Feature | Nano Banana Pro | DALL-E 3 | Midjourney | Stable Diffusion |
|---|---|---|---|---|
| Free tier | Yes (no sign-up) | Limited | No | Self-hosted only |
| Watermarks | None | None | None | None |
| Image editing | Yes | Yes | Limited | Yes |
| Aspect ratios | 5 options | 3 options | Custom | Custom |
| Model | Google Gemini | GPT-4o | Midjourney v6 | SD 3.5 |
| Speed | Fast (2-8 sec) | Medium | Medium | Varies |
| Web-based | Yes | Yes | Discord/Web | Self-hosted |

## Use Cases

- Social media content creation (Instagram posts, stories, reels)
- Blog and article illustrations
- Concept art and creative exploration
- Product mockups and visualizations
- Educational materials and presentations
- Quick prototyping for design projects

## How to Use

1. Go to ${appUrl}
2. Type a description of the image you want in the text prompt field
3. Optionally upload up to 2 reference images for editing or style reference
4. Select your preferred aspect ratio (1:1, 16:9, 9:16, 4:3, or 3:4)
5. Choose Pro mode (best quality) or Classic mode (faster)
6. Click "Run" to generate
7. Download the result or copy it to clipboard

## Technology Stack

- **AI Model**: Google Gemini (2.0 Flash for Pro, 2.5 Flash for Classic)
- **AI Infrastructure**: Vercel AI Gateway
- **Framework**: Next.js 16 (App Router)
- **Hosting**: Vercel
- **Image Storage**: Vercel Blob
- **Authentication**: Sign in with Vercel (OAuth 2.0)

## FAQ

**Is Nano Banana Pro free?**
Yes. You get free credits without needing to create an account. Sign in with Vercel to get additional credits.

**Are there watermarks on generated images?**
No. All images are generated without watermarks.

**What AI model does it use?**
Google Gemini models accessed through Vercel AI Gateway. Pro mode uses Gemini 2.0 Flash and Classic mode uses Gemini 2.5 Flash.

**Can I edit existing images?**
Yes. Upload up to 2 images and describe the changes you want in the text prompt.

**What aspect ratios are supported?**
Five aspect ratios: 1:1 (square), 16:9 (landscape), 9:16 (portrait), 4:3 (standard), 3:4 (portrait).

**Do I need to install anything?**
No. Nano Banana Pro is entirely web-based and works in any modern browser.

**How fast is image generation?**
Pro mode generates images in approximately 4-8 seconds. Classic mode is approximately 2x faster at 2-4 seconds.

**Who made Nano Banana Pro?**
It was built by the v0 team at Vercel as a showcase of the Vercel AI Gateway and Google Gemini integration.

## Links

- [Nano Banana Pro App](${appUrl}): The live application
- [Vercel AI Gateway](https://vercel.com/docs/ai/ai-gateway): The AI infrastructure powering the image generation
- [v0 by Vercel](https://v0.dev): The AI-powered development platform that built this app
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
