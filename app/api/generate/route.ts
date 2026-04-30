import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData } from '@/lib/github';
import { generateContent } from '@/lib/groq';
import { buildPrompts } from '@/lib/promptBuilder';

// Validate GitHub username format
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

function parseRetryHint(message: string): string | null {
  const marker = 'please try again in ';
  const index = message.toLowerCase().indexOf(marker);

  if (index === -1) return null;

  const hintStart = index + marker.length;
  const remainder = message.slice(hintStart).trim();
  const end = remainder.search(/[.\n]/);
  const hint = (end === -1 ? remainder : remainder.slice(0, end)).trim();

  return hint || null;
}

function formatApiError(error: unknown): { status: number; message: string } {
  const rawMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
  const lower = rawMessage.toLowerCase();

  if (lower.includes('not found')) {
    return { status: 404, message: rawMessage };
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('tpm') ||
    lower.includes('tpd')
  ) {
    const retryHint = parseRetryHint(rawMessage);
    const message = retryHint
      ? `AI provider rate limit reached. Please try again in ${retryHint}.`
      : 'AI provider rate limit reached. Please try again in a few minutes.';

    return { status: 429, message };
  }

  return {
    status: 500,
    message: 'Failed to generate README content right now. Please try again shortly.',
  };
}

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
    const { status, message } = formatApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
