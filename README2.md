# v0 Nano Banana Template

AI image generation playground powered by [Vercel AI Gateway](https://vercel.com/ai-gateway) and Google Gemini.

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/vercel/v0-nanobanana-template.git
   cd v0-nanobanana-template
   pnpm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API key |
   | `SESSION_SECRET` | Yes | Random string, min 32 chars |
   | `POSTGRES_URL` | Yes | PostgreSQL connection string |
   | `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
   | `VERCEL_OAUTH_CLIENT_ID` | No | Vercel OAuth app client ID |
   | `VERCEL_OAUTH_CLIENT_SECRET` | No | Vercel OAuth app secret |

3. **Run**

   ```bash
   pnpm dev
   ```

## Auth

Sign in with Vercel is optional. Without OAuth configured, the app shows a setup banner and operates in anonymous mode with rate limiting (1 generation/day per IP). With OAuth, authenticated users get unlimited generations.

To set up OAuth, create an app at [vercel.com/account/oauth-apps](https://vercel.com/account/oauth-apps) and add the client ID and secret to your environment.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/v0-nanobanana-template)
