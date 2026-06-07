import { describe, expect, it } from 'vitest';

import { sanitizeGenerateOptionsForPlan } from '@/lib/generate-options';

describe('sanitizeGenerateOptionsForPlan', () => {
  it('strips Pro-only options for free users', () => {
    const result = sanitizeGenerateOptionsForPlan(
      {
        voiceStyle: 'bold',
        insightDepth: 'advanced',
        sponsorNarrative: 'milestones',
        includeAchievements: false,
        includeCallToAction: false,
        includeBranding: false,
        workExperiences: [
          {
            company: 'Acme',
            role: 'Engineer',
            period: '2024',
            description: 'Built things',
          },
        ],
        wakatimeUsername: 'dev',
        includeStreakStats: true,
        blogFeedUrl: 'https://example.com/feed.xml',
      },
      'free'
    );

    expect(result).toMatchObject({
      voiceStyle: 'professional',
      insightDepth: 'standard',
      sponsorNarrative: 'impact',
      includeAchievements: true,
      includeCallToAction: true,
      includeBranding: true,
      workExperiences: [],
      wakatimeUsername: '',
      includeStreakStats: false,
      blogFeedUrl: '',
    });
  });

  it('preserves normalized Pro options for Pro users', () => {
    const result = sanitizeGenerateOptionsForPlan(
      {
        voiceStyle: 'bold',
        insightDepth: 'advanced',
        sponsorNarrative: 'milestones',
        includeAchievements: false,
        includeCallToAction: false,
        includeBranding: false,
        workExperiences: [
          {
            company: ' Acme ',
            role: ' Engineer ',
            period: ' 2024 ',
            description: ' Built things ',
          },
        ],
        wakatimeUsername: ' dev ',
        includeStreakStats: true,
        blogFeedUrl: ' https://example.com/feed.xml ',
      },
      'pro'
    );

    expect(result).toMatchObject({
      voiceStyle: 'bold',
      insightDepth: 'advanced',
      sponsorNarrative: 'milestones',
      includeAchievements: false,
      includeCallToAction: false,
      includeBranding: false,
      workExperiences: [
        {
          company: 'Acme',
          role: 'Engineer',
          period: '2024',
          description: 'Built things',
        },
      ],
      wakatimeUsername: 'dev',
      includeStreakStats: true,
      blogFeedUrl: 'https://example.com/feed.xml',
    });
  });
});
