import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData } from '@/lib/github';
import { generateContent } from '@/lib/openai';
import { buildPrompts } from '@/lib/promptBuilder';

// Validate GitHub username format
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.username !== 'string') {
      return NextResponse.json(
        { error: 'A GitHub username is required.' },
        { status: 400 }
      );
    }

    const username = body.username.trim().replace(/^@/, '');

    if (!username || !GITHUB_USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format.' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured.' },
        { status: 500 }
      );
    }

    // Fetch GitHub data
    const githubData = await fetchGitHubData(username);

    // Build prompts from real data
    const { bioPrompt, readmePrompt, skillsPrompt, sponsorPrompt } =
      buildPrompts(githubData);

    // Generate all content in parallel
    const [bio, readme, skills, sponsorPitch] = await Promise.all([
      generateContent(bioPrompt, 200),
      generateContent(readmePrompt, 2000),
      generateContent(skillsPrompt, 800),
      generateContent(sponsorPrompt, 800),
    ]);

    return NextResponse.json({
      githubData,
      content: { bio, readme, skills, sponsorPitch },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    const status =
      message.includes('not found') ? 404
      : message.includes('rate limit') ? 429
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
