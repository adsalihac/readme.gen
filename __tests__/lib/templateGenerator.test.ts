import { describe, it, expect } from 'vitest';
import { generateFromTemplate } from '@/lib/templateGenerator';
import type { GitHubData, GenerateOptions } from '@/types';
import { DEFAULT_GENERATE_OPTIONS } from '@/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_DATA: GitHubData = {
  user: {
    login: 'testuser',
    name: 'Test User',
    bio: 'A developer',
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    public_repos: 25,
    followers: 120,
    following: 50,
    html_url: 'https://github.com/testuser',
    location: 'San Francisco',
    company: '@acme-corp',
    blog: 'https://testuser.dev',
    twitter_username: 'testuser',
    created_at: '2018-01-15T00:00:00Z',
  },
  repos: [
    {
      name: 'awesome-tool',
      description: 'A developer productivity tool',
      language: 'TypeScript',
      stargazers_count: 450,
      forks_count: 30,
      html_url: 'https://github.com/testuser/awesome-tool',
      topics: ['typescript', 'cli', 'developer-tools'],
    },
    {
      name: 'react-components',
      description: 'Reusable React component library',
      language: 'TypeScript',
      stargazers_count: 200,
      forks_count: 15,
      html_url: 'https://github.com/testuser/react-components',
      topics: ['react', 'components', 'ui'],
    },
    {
      name: 'python-utils',
      description: 'Python utility scripts',
      language: 'Python',
      stargazers_count: 80,
      forks_count: 10,
      html_url: 'https://github.com/testuser/python-utils',
      topics: ['python', 'utilities'],
    },
    {
      name: 'go-api',
      description: 'REST API built with Go',
      language: 'Go',
      stargazers_count: 50,
      forks_count: 5,
      html_url: 'https://github.com/testuser/go-api',
      topics: ['go', 'rest', 'api'],
    },
  ],
  languages: {
    TypeScript: 12,
    Python: 5,
    Go: 3,
    JavaScript: 2,
    Shell: 1,
  },
  totalStars: 780,
};

const MINIMAL_DATA: GitHubData = {
  user: {
    login: 'newdev',
    name: null,
    bio: null,
    avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
    public_repos: 2,
    followers: 0,
    following: 3,
    html_url: 'https://github.com/newdev',
    location: null,
    company: null,
    blog: null,
    twitter_username: null,
    created_at: '2024-06-01T00:00:00Z',
  },
  repos: [],
  languages: {},
  totalStars: 0,
};

function opts(overrides: Partial<GenerateOptions> = {}): GenerateOptions {
  return { ...DEFAULT_GENERATE_OPTIONS, ...overrides };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generateFromTemplate', () => {
  it('returns all four content fields', () => {
    const result = generateFromTemplate(MOCK_DATA, opts());
    expect(result).toHaveProperty('bio');
    expect(result).toHaveProperty('readme');
    expect(result).toHaveProperty('skills');
    expect(result).toHaveProperty('sponsorPitch');
    expect(typeof result.bio).toBe('string');
    expect(typeof result.readme).toBe('string');
    expect(typeof result.skills).toBe('string');
    expect(typeof result.sponsorPitch).toBe('string');
  });

  it('produces non-empty content for a populated profile', () => {
    const result = generateFromTemplate(MOCK_DATA, opts());
    expect(result.bio.length).toBeGreaterThan(20);
    expect(result.readme.length).toBeGreaterThan(100);
    expect(result.skills.length).toBeGreaterThan(20);
    expect(result.sponsorPitch.length).toBeGreaterThan(50);
  });

  it('handles minimal / empty profile data gracefully', () => {
    const result = generateFromTemplate(MINIMAL_DATA, opts());
    expect(result.bio).toBeTruthy();
    expect(result.readme).toBeTruthy();
    expect(result.skills).toBeTruthy();
    expect(result.sponsorPitch).toBeTruthy();
  });
});

// ─── Bio ──────────────────────────────────────────────────────────────────────

describe('bio generation', () => {
  it('includes the user name', () => {
    const { bio } = generateFromTemplate(MOCK_DATA, opts());
    expect(bio).toContain('Test User');
  });

  it('includes location when available', () => {
    const { bio } = generateFromTemplate(MOCK_DATA, opts());
    expect(bio).toContain('San Francisco');
  });

  it('includes company when available', () => {
    const { bio } = generateFromTemplate(MOCK_DATA, opts());
    expect(bio).toContain('@acme-corp');
  });

  it('adapts tone for friendly voice', () => {
    const { bio } = generateFromTemplate(MOCK_DATA, opts({ voiceStyle: 'friendly' }));
    expect(bio).toMatch(/Hey!|love building/i);
  });

  it('adapts tone for bold voice', () => {
    const { bio } = generateFromTemplate(MOCK_DATA, opts({ voiceStyle: 'bold' }));
    expect(bio).toMatch(/shipping|production-grade|Software Engineer/i);
  });

  it('uses login when name is null', () => {
    const { bio } = generateFromTemplate(MINIMAL_DATA, opts());
    expect(bio).toContain('newdev');
  });
});

// ─── README ───────────────────────────────────────────────────────────────────

describe('readme generation', () => {
  it('starts with an h1 greeting', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toMatch(/^# /);
  });

  it('contains tech stack section with shields.io badges', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('## 🛠 Tech Stack');
    expect(readme).toContain('img.shields.io/badge/');
  });

  it('contains GitHub stats section', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('## 📊 GitHub Stats');
    expect(readme).toContain('github-readme-stats.vercel.app');
  });

  it('contains featured projects section', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('## 🚀 Featured Projects');
    expect(readme).toContain('awesome-tool');
  });

  it('contains connect section with GitHub link', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('## 📫 Connect');
    expect(readme).toContain('github.com/testuser');
  });

  it('includes blog and twitter when available', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('testuser.dev');
    expect(readme).toContain('twitter.com/testuser');
  });

  it('contains profile insights section', () => {
    const { readme } = generateFromTemplate(MOCK_DATA, opts());
    expect(readme).toContain('## 🔍 Profile Insights');
  });

  it('includes achievements when option is enabled', () => {
    const { readme } = generateFromTemplate(
      MOCK_DATA,
      opts({ includeAchievements: true })
    );
    expect(readme).toContain('## 🏆 Highlights');
  });

  it('omits achievements when option is disabled', () => {
    const { readme } = generateFromTemplate(
      MOCK_DATA,
      opts({ includeAchievements: false })
    );
    expect(readme).not.toContain('## 🏆 Highlights');
  });
});

// ─── Skills ───────────────────────────────────────────────────────────────────

describe('skills generation', () => {
  it('generates shields.io badges for detected languages', () => {
    const { skills } = generateFromTemplate(MOCK_DATA, opts());
    expect(skills).toContain('img.shields.io/badge/');
    expect(skills).toContain('TypeScript');
    expect(skills).toContain('Python');
  });

  it('groups badges under category headings', () => {
    const { skills } = generateFromTemplate(MOCK_DATA, opts());
    expect(skills).toContain('### Languages');
  });

  it('infers ecosystem frameworks from languages', () => {
    const { skills } = generateFromTemplate(MOCK_DATA, opts());
    // TypeScript should infer React/Next.js ecosystem
    expect(skills).toMatch(/React|Next\.js|Node\.js/);
  });

  it('handles empty languages gracefully', () => {
    const { skills } = generateFromTemplate(MINIMAL_DATA, opts());
    expect(skills).toBeTruthy();
  });
});

// ─── Sponsor Pitch ────────────────────────────────────────────────────────────

describe('sponsor pitch generation', () => {
  it('includes the user name', () => {
    const { sponsorPitch } = generateFromTemplate(MOCK_DATA, opts());
    expect(sponsorPitch).toContain('Test User');
  });

  it('includes CTA when option is enabled', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ includeCallToAction: true })
    );
    expect(sponsorPitch).toContain('Become a sponsor');
    expect(sponsorPitch).toContain('github.com/sponsors/testuser');
  });

  it('omits CTA when option is disabled', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ includeCallToAction: false })
    );
    expect(sponsorPitch).not.toContain('Become a sponsor');
  });

  it('uses journey narrative when selected', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ sponsorNarrative: 'journey' })
    );
    expect(sponsorPitch).toMatch(/years|year/i);
  });

  it('uses milestones narrative when selected', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ sponsorNarrative: 'milestones' })
    );
    expect(sponsorPitch).toContain('Milestones achieved');
  });

  it('adapts tone for friendly voice', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ voiceStyle: 'friendly' })
    );
    expect(sponsorPitch).toMatch(/Hi!|journey|💙/);
  });

  it('adapts tone for bold voice', () => {
    const { sponsorPitch } = generateFromTemplate(
      MOCK_DATA,
      opts({ voiceStyle: 'bold' })
    );
    expect(sponsorPitch).toMatch(/infrastructure|trust|rely on/i);
  });
});

// ─── Determinism ──────────────────────────────────────────────────────────────

describe('determinism', () => {
  it('produces identical output for the same inputs', () => {
    const options = opts();
    const result1 = generateFromTemplate(MOCK_DATA, options);
    const result2 = generateFromTemplate(MOCK_DATA, options);
    expect(result1).toEqual(result2);
  });

  it('produces different output for different voice styles', () => {
    const professional = generateFromTemplate(MOCK_DATA, opts({ voiceStyle: 'professional' }));
    const friendly = generateFromTemplate(MOCK_DATA, opts({ voiceStyle: 'friendly' }));
    const bold = generateFromTemplate(MOCK_DATA, opts({ voiceStyle: 'bold' }));
    expect(professional.bio).not.toBe(friendly.bio);
    expect(professional.bio).not.toBe(bold.bio);
    expect(friendly.bio).not.toBe(bold.bio);
  });
});
