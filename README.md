# readme.gen

AI-powered GitHub profile content generation for developers who want a cleaner README, sharper bio, stronger skills section, and a sponsor pitch without writing everything from scratch.

## Overview

readme.gen takes a GitHub username, fetches public profile and repository data, and turns it into polished profile content using Groq-hosted models.

The app is built as a Next.js App Router project with a minimal UI, server-side API generation, markdown preview support, and copy-ready outputs for multiple profile sections.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS, `@tailwindcss/typography`
- AI Provider: Groq
- Markdown Rendering: `react-markdown`, `remark-gfm`
- Data Source: GitHub REST API

## How It Works

1. A user enters a GitHub username in the UI.
2. The app validates the username and requests GitHub profile and repository data.
3. Prompt builders turn that data into focused generation prompts.
4. The API generates four outputs in parallel: bio, README, skills, and sponsor pitch.
5. The frontend renders the result with copy-friendly tabs and markdown preview.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/adsalihac/readme.gen.git
cd readme.gen
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Setup

Create a `.env.local` file and configure the following variables.

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes | Used for content generation through the Groq API. |
| `GITHUB_TOKEN` | No | Raises GitHub API rate limits and helps avoid anonymous request throttling. |

### Generating API Keys

#### Groq API Key

1. Go to `https://console.groq.com/keys` and sign in to your Groq account.
2. Open the API Keys page from the Groq console.
3. Click `Create API Key` or `Generate Key`.
4. Copy the generated key immediately after it is shown.
5. Add it to `.env.local` as `GROQ_API_KEY`.

#### GitHub Token

1. Open GitHub and go to `Settings > Developer settings > Personal access tokens`.
2. Choose either `Tokens (classic)` or `Fine-grained tokens`.
3. Click `Generate new token`.
4. Give the token a name, choose an expiration, and grant read access for the profile data you need.
5. Create the token and copy it immediately after GitHub displays it.
6. Add it to `.env.local` as `GITHUB_TOKEN`.

Recommended minimum access:

- Public profile read access is enough for public GitHub user data.
- If you use a fine-grained token, select access that allows reading public account and repository metadata.

Example:

```env
GROQ_API_KEY=gsk_*************************
GITHUB_TOKEN=github_*************************
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Reference

### `POST /api/generate`

Generates profile content for a GitHub username.

Request body:

```json
{
  "username": "adsalihac"
}
```

Successful response:

```json
{
  "githubData": {
    "user": {},
    "repos": [],
    "languages": {
      "TypeScript": 4,
      "Python": 2
    },
    "totalStars": 123
  },
  "content": {
    "bio": "...",
    "readme": "...",
    "skills": "...",
    "sponsorPitch": "..."
  }
}
```

Possible API errors:

- `400` for missing or invalid usernames
- `404` when the GitHub user does not exist
- `429` when GitHub rate limits are exceeded
- `500` when the Groq API key is missing or another server error occurs

## Project Structure

```text
readme.gen/
├── app/
│   ├── api/generate/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ErrorState.tsx
│   ├── Footer.tsx
│   ├── GenerateModal.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LoadingState.tsx
│   ├── MarkdownPreview.tsx
│   ├── ProfileCard.tsx
│   └── ResultTabs.tsx
├── lib/
│   ├── github.ts
│   ├── openai.ts
│   └── promptBuilder.ts
├── types/
│   └── index.ts
├── .env.example
├── package.json
└── README.md
```

## Deployment

This project is suitable for deployment on platforms that support Next.js applications, including Vercel.

Before deploying, make sure `GROQ_API_KEY` is configured in your hosting environment. Add `GITHUB_TOKEN` as well if you want higher GitHub API limits in production.

## Contributing

[![Fork this repo](https://img.shields.io/badge/Fork-readme.gen-blue?style=for-the-badge&logo=github)](https://github.com/adsalihac/readme.gen/fork)
[![GitHub Stars](https://img.shields.io/github/stars/adsalihac/readme.gen?style=for-the-badge&logo=github)](https://github.com/adsalihac/readme.gen/stargazers)

Issues and pull requests are welcome. If you plan to make larger changes, open an issue first so the scope and direction are clear.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
