import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGitHubData } from '@/lib/github';
import type { GitHubUser, GitHubRepo } from '@/types';

const mockUser: GitHubUser = {
  login: 'testuser',
  name: 'Test User',
  bio: 'A developer',
  avatar_url: 'https://example.com/avatar.png',
  public_repos: 5,
  followers: 10,
  following: 5,
  html_url: 'https://github.com/testuser',
  location: 'Earth',
  company: null,
  blog: null,
  twitter_username: null,
  created_at: '2020-01-01T00:00:00Z',
};

const mockRepos: GitHubRepo[] = [
  { name: 'repo-a', description: 'Desc A', language: 'TypeScript', stargazers_count: 50, forks_count: 5, html_url: 'https://github.com/testuser/repo-a', topics: [] },
  { name: 'repo-b', description: 'Desc B', language: 'Python', stargazers_count: 30, forks_count: 3, html_url: 'https://github.com/testuser/repo-b', topics: [] },
  { name: 'repo-c', description: null, language: 'TypeScript', stargazers_count: 20, forks_count: 2, html_url: 'https://github.com/testuser/repo-c', topics: [] },
];

function makeFetch(
  userStatus: number,
  reposStatus: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userBody: any = mockUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reposBody: any = mockRepos,
) {
  return vi
    .fn()
    .mockResolvedValueOnce({ ok: userStatus === 200, status: userStatus, json: async () => userBody })
    .mockResolvedValueOnce({ ok: reposStatus === 200, status: reposStatus, json: async () => reposBody });
}

describe('fetchGitHubData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', makeFetch(200, 200));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GITHUB_TOKEN;
  });

  it('returns user and repos on success', async () => {
    const result = await fetchGitHubData('testuser');
    expect(result.user.login).toBe('testuser');
    expect(result.repos).toHaveLength(3);
  });

  it('tallies language frequency across repos', async () => {
    const result = await fetchGitHubData('testuser');
    expect(result.languages['TypeScript']).toBe(2);
    expect(result.languages['Python']).toBe(1);
  });

  it('sums total stars across all repos', async () => {
    const result = await fetchGitHubData('testuser');
    expect(result.totalStars).toBe(100); // 50 + 30 + 20
  });

  it('caps returned repos at 10', async () => {
    const manyRepos = Array.from({ length: 15 }, (_, i) => ({
      ...mockRepos[0],
      name: `repo-${i}`,
      stargazers_count: i,
    }));
    vi.stubGlobal('fetch', makeFetch(200, 200, mockUser, manyRepos));
    const result = await fetchGitHubData('testuser');
    expect(result.repos).toHaveLength(10);
  });

  it('throws a descriptive error on 404', async () => {
    vi.stubGlobal('fetch', makeFetch(404, 200));
    await expect(fetchGitHubData('nobody')).rejects.toThrow('"nobody" not found');
  });

  it('throws a rate-limit error on 403', async () => {
    vi.stubGlobal('fetch', makeFetch(403, 200));
    await expect(fetchGitHubData('testuser')).rejects.toThrow('rate limit');
  });

  it('throws a generic error for other non-ok user responses', async () => {
    vi.stubGlobal('fetch', makeFetch(500, 200));
    await expect(fetchGitHubData('testuser')).rejects.toThrow('Failed to fetch GitHub profile');
  });

  it('returns empty repos array when the repos request fails', async () => {
    vi.stubGlobal('fetch', makeFetch(200, 500));
    const result = await fetchGitHubData('testuser');
    expect(result.repos).toHaveLength(0);
    expect(result.totalStars).toBe(0);
  });

  it('skips repos with null language from the language tally', async () => {
    const reposWithNull = [{ ...mockRepos[0], language: null }];
    vi.stubGlobal('fetch', makeFetch(200, 200, mockUser, reposWithNull));
    const result = await fetchGitHubData('testuser');
    expect(Object.keys(result.languages)).toHaveLength(0);
  });

  it('includes Authorization header when GITHUB_TOKEN is set', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    const spy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockUser })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', spy);
    await fetchGitHubData('testuser');
    const calledHeaders = spy.mock.calls[0][1].headers;
    expect(calledHeaders.Authorization).toBe('Bearer test-token');
  });

  it('omits Authorization header when GITHUB_TOKEN is not set', async () => {
    const spy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockUser })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', spy);
    await fetchGitHubData('testuser');
    const calledHeaders = spy.mock.calls[0][1].headers;
    expect(calledHeaders.Authorization).toBeUndefined();
  });
});
