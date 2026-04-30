import { describe, it, expect } from 'vitest';
import { buildPrompts } from '@/lib/promptBuilder';
import type { GitHubData, GitHubRepo, GitHubUser } from '@/types';

const baseUser: GitHubUser = {
  login: 'testuser',
  name: 'Test User',
  bio: 'Developer',
  avatar_url: 'https://example.com/avatar.png',
  public_repos: 10,
  followers: 50,
  following: 20,
  html_url: 'https://github.com/testuser',
  location: 'Earth',
  company: 'ACME',
  blog: 'https://example.com',
  twitter_username: null,
  created_at: '2020-01-01T00:00:00Z',
};

const baseRepo: GitHubRepo = {
  name: 'repo-one',
  description: 'A great repo',
  language: 'TypeScript',
  stargazers_count: 100,
  forks_count: 10,
  html_url: 'https://github.com/testuser/repo-one',
  topics: [],
};

function makeData(overrides: Partial<GitHubData> = {}): GitHubData {
  return {
    user: baseUser,
    repos: [baseRepo],
    languages: { TypeScript: 3, Python: 1 },
    totalStars: 100,
    ...overrides,
  };
}

describe('buildPrompts', () => {
  it('returns all four prompt keys', () => {
    const result = buildPrompts(makeData());
    expect(result).toHaveProperty('bioPrompt');
    expect(result).toHaveProperty('readmePrompt');
    expect(result).toHaveProperty('skillsPrompt');
    expect(result).toHaveProperty('sponsorPrompt');
  });

  it('all prompts contain the github username', () => {
    const result = buildPrompts(makeData());
    for (const prompt of Object.values(result)) {
      expect(prompt).toContain('testuser');
    }
  });

  it('sorts languages by frequency — most used first', () => {
    const data = makeData({ languages: { Python: 2, Rust: 5, Go: 1 } });
    const { bioPrompt } = buildPrompts(data);
    const rustIdx = bioPrompt.indexOf('Rust');
    const pythonIdx = bioPrompt.indexOf('Python');
    const goIdx = bioPrompt.indexOf('Go');
    expect(rustIdx).toBeLessThan(pythonIdx);
    expect(pythonIdx).toBeLessThan(goIdx);
  });

  it('limits languages to top 8', () => {
    const languages: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) languages[`Lang${i}`] = i;
    const { bioPrompt } = buildPrompts(makeData({ languages }));
    // Top 8 by frequency: Lang12 → Lang5. Excluded: Lang4, Lang3, Lang2, Lang1.
    // ('Lang1' is a substring of 'Lang10', 'Lang11', 'Lang12', so check 'Lang4' instead)
    expect(bioPrompt).not.toContain('Lang4');
    expect(bioPrompt).not.toContain('Lang3');
    expect(bioPrompt).toContain('Lang5');
    expect(bioPrompt).toContain('Lang12');
  });

  it('shows "None detected" when languages object is empty', () => {
    const { bioPrompt } = buildPrompts(makeData({ languages: {} }));
    expect(bioPrompt).toContain('None detected');
  });

  it('falls back to login when name is null', () => {
    const data = makeData({ user: { ...baseUser, name: null } });
    const { bioPrompt } = buildPrompts(data);
    expect(bioPrompt).toContain('testuser');
  });

  it('shows "None" for bio when bio is null', () => {
    const data = makeData({ user: { ...baseUser, bio: null } });
    const { bioPrompt } = buildPrompts(data);
    expect(bioPrompt).toContain('Existing Bio: None');
  });

  it('shows "Not specified" for location when location is null', () => {
    const data = makeData({ user: { ...baseUser, location: null } });
    const { bioPrompt } = buildPrompts(data);
    expect(bioPrompt).toContain('Location: Not specified');
  });

  it('shows "No public repos" when repos array is empty', () => {
    const { bioPrompt } = buildPrompts(makeData({ repos: [] }));
    expect(bioPrompt).toContain('No public repos');
  });

  it('limits repos shown in context to 6', () => {
    const repos = Array.from({ length: 10 }, (_, i) => ({
      ...baseRepo,
      name: `repo-${i}`,
    }));
    const { bioPrompt } = buildPrompts(makeData({ repos }));
    expect(bioPrompt).toContain('repo-5');
    expect(bioPrompt).not.toContain('repo-6');
  });

  it('uses "No description" fallback for repos without a description', () => {
    const repos = [{ ...baseRepo, description: null }];
    const { readmePrompt } = buildPrompts(makeData({ repos }));
    expect(readmePrompt).toContain('No description');
  });

  it('omits the language separator when repo language is null', () => {
    const repos = [{ ...baseRepo, language: null, name: 'no-lang-repo' }];
    const { readmePrompt } = buildPrompts(makeData({ repos }));
    const repoLine = readmePrompt.split('\n').find((l) => l.includes('no-lang-repo'));
    expect(repoLine).not.toContain('·');
  });

  it('includes star count in repo context line', () => {
    const { readmePrompt } = buildPrompts(makeData());
    expect(readmePrompt).toContain('⭐ 100');
  });

  it('includes total stars in context', () => {
    const data = makeData({ totalStars: 999 });
    const { bioPrompt } = buildPrompts(data);
    expect(bioPrompt).toContain('Total Stars Earned: 999');
  });
});
