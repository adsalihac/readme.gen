import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import { POST } from '@/app/api/generate/route';
import { getCurrentPlan } from '@/lib/entitlements';
import { fetchGitHubData } from '@/lib/github';
import { generateFromTemplate } from '@/lib/templateGenerator';
import type { GitHubData, GenerateOptions } from '@/types';

vi.mock('@/lib/entitlements', () => ({
  getCurrentPlan: vi.fn(),
}));

vi.mock('@/lib/github', () => ({
  fetchGitHubData: vi.fn(),
}));

vi.mock('@/lib/templateGenerator', () => ({
  generateFromTemplate: vi.fn((_: GitHubData, options: GenerateOptions) => ({
    bio: 'bio',
    readme: options.includeBranding ? 'readme with branding' : 'readme without branding',
    skills: 'skills',
    sponsorPitch: 'sponsor',
    blogWorkflow: options.blogFeedUrl ? 'workflow' : undefined,
  })),
}));

const githubData: GitHubData = {
  user: {
    login: 'testuser',
    name: 'Test User',
    bio: null,
    avatar_url: 'https://example.com/avatar.png',
    public_repos: 1,
    followers: 0,
    following: 0,
    html_url: 'https://github.com/testuser',
    location: null,
    company: null,
    blog: null,
    twitter_username: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  repos: [],
  languages: {},
  totalStars: 0,
};

function makeRequest(username: string, options: unknown): NextRequest {
  return new Request('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': username,
    },
    body: JSON.stringify({ username, options }),
  }) as NextRequest;
}

describe('POST /api/generate premium sanitization', () => {
  beforeEach(() => {
    vi.mocked(getCurrentPlan).mockReset();
    vi.mocked(fetchGitHubData).mockReset();
    vi.mocked(generateFromTemplate).mockClear();
    vi.mocked(fetchGitHubData).mockResolvedValue(githubData);
  });

  it('strips Pro-only options for free users', async () => {
    vi.mocked(getCurrentPlan).mockResolvedValue('free');

    const response = await POST(
      makeRequest('freeuser', {
        voiceStyle: 'bold',
        insightDepth: 'advanced',
        includeBranding: false,
        workExperiences: [{ company: 'Acme' }],
        wakatimeUsername: 'dev',
        includeStreakStats: true,
        blogFeedUrl: 'https://example.com/feed.xml',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.optionsUsed).toMatchObject({
      voiceStyle: 'professional',
      insightDepth: 'standard',
      includeBranding: true,
      workExperiences: [],
      wakatimeUsername: '',
      includeStreakStats: false,
      blogFeedUrl: '',
    });
  });

  it('preserves Pro-only options for Pro users', async () => {
    vi.mocked(getCurrentPlan).mockResolvedValue('pro');

    const response = await POST(
      makeRequest('prouser', {
        voiceStyle: 'bold',
        insightDepth: 'advanced',
        includeBranding: false,
        workExperiences: [{ company: 'Acme', role: 'Engineer' }],
        wakatimeUsername: 'dev',
        includeStreakStats: true,
        blogFeedUrl: 'https://example.com/feed.xml',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.optionsUsed).toMatchObject({
      voiceStyle: 'bold',
      insightDepth: 'advanced',
      includeBranding: false,
      workExperiences: [{ company: 'Acme', role: 'Engineer' }],
      wakatimeUsername: 'dev',
      includeStreakStats: true,
      blogFeedUrl: 'https://example.com/feed.xml',
    });
    expect(body.content.blogWorkflow).toBe('workflow');
  });

  it('returns a clear error when the GitHub token is invalid', async () => {
    vi.mocked(getCurrentPlan).mockResolvedValue('free');
    vi.mocked(fetchGitHubData).mockRejectedValue(
      new Error('GitHub token is invalid. Update or remove GITHUB_TOKEN.')
    );

    const response = await POST(makeRequest('testuser', {}));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('GitHub token is invalid. Update or remove GITHUB_TOKEN.');
  });
});
