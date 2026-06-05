import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubData } from '@/lib/github';
import { generateFromTemplate } from '@/lib/templateGenerator';
import {
  DEFAULT_GENERATE_OPTIONS,
  type GenerateOptions,
  type InsightDepth,
  type SponsorNarrative,
  type VoiceStyle,
  type WorkExperience,
} from '@/types';

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
  optionsUsed: GenerateOptions;
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

function asEnumValue<T extends string>(
  value: unknown,
  valid: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && valid.includes(value as T)
    ? (value as T)
    : fallback;
}

function normalizeOptions(raw: unknown): GenerateOptions {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_GENERATE_OPTIONS };
  }

  const parsed = raw as Partial<GenerateOptions>;

  return {
    voiceStyle: asEnumValue<VoiceStyle>(
      parsed.voiceStyle,
      ['professional', 'friendly', 'bold'],
      DEFAULT_GENERATE_OPTIONS.voiceStyle
    ),
    insightDepth: asEnumValue<InsightDepth>(
      parsed.insightDepth,
      ['standard', 'advanced'],
      DEFAULT_GENERATE_OPTIONS.insightDepth
    ),
    sponsorNarrative: asEnumValue<SponsorNarrative>(
      parsed.sponsorNarrative,
      ['impact', 'journey', 'milestones'],
      DEFAULT_GENERATE_OPTIONS.sponsorNarrative
    ),
    includeAchievements:
      typeof parsed.includeAchievements === 'boolean'
        ? parsed.includeAchievements
        : DEFAULT_GENERATE_OPTIONS.includeAchievements,
    includeCallToAction:
      typeof parsed.includeCallToAction === 'boolean'
        ? parsed.includeCallToAction
        : DEFAULT_GENERATE_OPTIONS.includeCallToAction,
    workExperiences: Array.isArray(parsed.workExperiences)
      ? parsed.workExperiences
          .map((item: any) => {
            if (item && typeof item === 'object') {
              return {
                company: String(item.company ?? ''),
                role: String(item.role ?? ''),
                period: String(item.period ?? ''),
                description: String(item.description ?? ''),
              };
            }
            return null;
          })
          .filter(Boolean) as WorkExperience[]
      : DEFAULT_GENERATE_OPTIONS.workExperiences,
    wakatimeUsername: typeof parsed.wakatimeUsername === 'string'
      ? parsed.wakatimeUsername
      : DEFAULT_GENERATE_OPTIONS.wakatimeUsername,
    includeStreakStats: typeof parsed.includeStreakStats === 'boolean'
      ? parsed.includeStreakStats
      : DEFAULT_GENERATE_OPTIONS.includeStreakStats,
    blogFeedUrl: typeof parsed.blogFeedUrl === 'string'
      ? parsed.blogFeedUrl
      : DEFAULT_GENERATE_OPTIONS.blogFeedUrl,
  };
}

function getCacheKey(username: string, options: GenerateOptions): string {
  return `${username}:${JSON.stringify(options)}`;
}

async function buildGeneratedPayload(
  username: string,
  options: GenerateOptions
): Promise<GeneratedPayload> {
  const githubData = await fetchGitHubData(username);
  const content = generateFromTemplate(githubData, options);

  return {
    githubData,
    content,
    optionsUsed: options,
  };
}

function formatApiError(error: unknown): { status: number; message: string } {
  const rawMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
  const lower = rawMessage.toLowerCase();

  if (lower.includes('not found')) {
    return { status: 404, message: rawMessage };
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests')
  ) {
    return {
      status: 429,
      message: 'GitHub API rate limit reached. Add a GITHUB_TOKEN to increase limits.',
    };
  }

  return {
    status: 500,
    message: 'Failed to generate README content. Please try again shortly.',
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



    const options = normalizeOptions(body.options);
    const cacheKey = getCacheKey(username, options);

    const cached = getCachedPayload(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const pending = inFlightRequests.get(cacheKey);
    if (pending) {
      const data = await pending;
      return NextResponse.json({ ...data, cached: true });
    }

    const generationPromise = buildGeneratedPayload(username, options);
    inFlightRequests.set(cacheKey, generationPromise);

    try {
      const data = await generationPromise;
      setCachedPayload(cacheKey, data);
      return NextResponse.json({ ...data, cached: false });
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  } catch (error) {
    const { status, message } = formatApiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
