import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData } from '@/lib/github';
import { generateContent } from '@/lib/groq';
import { buildPrompts } from '@/lib/promptBuilder';

// Validate GitHub username format
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

type GeneratedPayload = {
  githubData: Awaited<ReturnType<typeof fetchGitHubData>>;
  content: {
    bio: string;
    readme: string;
    skills: string;
    sponsorPitch: string;
  };
};

type CacheEntry = {
  data: GeneratedPayload;
  expiresAt: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const CACHE_TTL_MS = Math.max(
  0,
  Number(process.env.GENERATE_CACHE_TTL_SECONDS ?? '1800') * 1000
);
const RATE_LIMIT_WINDOW_MS = Math.max(
  1000,
  Number(process.env.GENERATE_RATE_LIMIT_WINDOW_SECONDS ?? '60') * 1000
);
const RATE_LIMIT_MAX_REQUESTS = Math.max(
  1,
  Number(process.env.GENERATE_RATE_LIMIT_MAX_REQUESTS ?? '12')
);

const globalState = globalThis as typeof globalThis & {
  __readmeGenCache?: Map<string, CacheEntry>;
  __readmeGenInFlight?: Map<string, Promise<GeneratedPayload>>;
  __readmeGenRateLimit?: Map<string, RateLimitEntry>;
};

const responseCache = globalState.__readmeGenCache ?? new Map<string, CacheEntry>();
const inFlightRequests = globalState.__readmeGenInFlight ?? new Map<string, Promise<GeneratedPayload>>();
const rateLimitMap = globalState.__readmeGenRateLimit ?? new Map<string, RateLimitEntry>();

globalState.__readmeGenCache ??= responseCache;
globalState.__readmeGenInFlight ??= inFlightRequests;
globalState.__readmeGenRateLimit ??= rateLimitMap;

function getClientId(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return req.headers.get('x-real-ip')?.trim() || 'anonymous';
}

function consumeRateLimit(clientId: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const now = Date.now();
  const current = rateLimitMap.get(clientId);

  if (!current || now >= current.resetAt) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitMap.set(clientId, current);
  return { allowed: true };
}

function getCachedPayload(username: string): GeneratedPayload | null {
  const cached = responseCache.get(username);
  if (!cached) return null;

  if (Date.now() >= cached.expiresAt) {
    responseCache.delete(username);
    return null;
  }

  return cached.data;
}

function setCachedPayload(username: string, data: GeneratedPayload) {
  if (CACHE_TTL_MS <= 0) return;

  responseCache.set(username, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function buildGeneratedPayload(username: string): Promise<GeneratedPayload> {
  const githubData = await fetchGitHubData(username);

  const { bioPrompt, readmePrompt, skillsPrompt, sponsorPrompt } =
    buildPrompts(githubData);

  const [bio, readme, skills, sponsorPitch] = await Promise.all([
    generateContent(bioPrompt, 200),
    generateContent(readmePrompt, 2000),
    generateContent(skillsPrompt, 800),
    generateContent(sponsorPrompt, 800),
  ]);

  return {
    githubData,
    content: { bio, readme, skills, sponsorPitch },
  };
}

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
    const clientId = getClientId(req);
    const limit = consumeRateLimit(clientId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${limit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.username !== 'string') {
      return NextResponse.json(
        { error: 'A GitHub username is required.' },
        { status: 400 }
      );
    }

    const username = body.username.trim().replace(/^@/, '').toLowerCase();

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

    const cached = getCachedPayload(username);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const pending = inFlightRequests.get(username);
    if (pending) {
      const data = await pending;
      return NextResponse.json({ ...data, cached: true });
    }

    const generationPromise = buildGeneratedPayload(username);
    inFlightRequests.set(username, generationPromise);

    try {
      const data = await generationPromise;
      setCachedPayload(username, data);
      return NextResponse.json({ ...data, cached: false });
    } finally {
      inFlightRequests.delete(username);
    }
  } catch (error) {
    const { status, message } = formatApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
