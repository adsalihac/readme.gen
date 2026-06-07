import {
  DEFAULT_GENERATE_OPTIONS,
  type GenerateOptions,
  type InsightDepth,
  type SponsorNarrative,
  type VoiceStyle,
  type WorkExperience,
} from '@/types';

import type { UserPlan } from './entitlements';

function asEnumValue<T extends string>(
  value: unknown,
  valid: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && valid.includes(value as T)
    ? (value as T)
    : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toCleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeWorkExperience(value: unknown): WorkExperience | null {
  if (!isRecord(value)) return null;

  const experience = {
    company: toCleanString(value.company),
    role: toCleanString(value.role),
    period: toCleanString(value.period),
    description: toCleanString(value.description),
  };

  return Object.values(experience).some(Boolean) ? experience : null;
}

export function normalizeGenerateOptions(raw: unknown): GenerateOptions {
  if (!isRecord(raw)) {
    return { ...DEFAULT_GENERATE_OPTIONS };
  }

  return {
    voiceStyle: asEnumValue<VoiceStyle>(
      raw.voiceStyle,
      ['professional', 'friendly', 'bold'],
      DEFAULT_GENERATE_OPTIONS.voiceStyle
    ),
    insightDepth: asEnumValue<InsightDepth>(
      raw.insightDepth,
      ['standard', 'advanced'],
      DEFAULT_GENERATE_OPTIONS.insightDepth
    ),
    sponsorNarrative: asEnumValue<SponsorNarrative>(
      raw.sponsorNarrative,
      ['impact', 'journey', 'milestones'],
      DEFAULT_GENERATE_OPTIONS.sponsorNarrative
    ),
    includeAchievements:
      typeof raw.includeAchievements === 'boolean'
        ? raw.includeAchievements
        : DEFAULT_GENERATE_OPTIONS.includeAchievements,
    includeCallToAction:
      typeof raw.includeCallToAction === 'boolean'
        ? raw.includeCallToAction
        : DEFAULT_GENERATE_OPTIONS.includeCallToAction,
    includeBranding:
      typeof raw.includeBranding === 'boolean'
        ? raw.includeBranding
        : DEFAULT_GENERATE_OPTIONS.includeBranding,
    workExperiences: Array.isArray(raw.workExperiences)
      ? raw.workExperiences
          .map(normalizeWorkExperience)
          .filter((item): item is WorkExperience => item !== null)
      : DEFAULT_GENERATE_OPTIONS.workExperiences,
    wakatimeUsername:
      typeof raw.wakatimeUsername === 'string'
        ? raw.wakatimeUsername.trim()
        : DEFAULT_GENERATE_OPTIONS.wakatimeUsername,
    includeStreakStats:
      typeof raw.includeStreakStats === 'boolean'
        ? raw.includeStreakStats
        : DEFAULT_GENERATE_OPTIONS.includeStreakStats,
    blogFeedUrl:
      typeof raw.blogFeedUrl === 'string'
        ? raw.blogFeedUrl.trim()
        : DEFAULT_GENERATE_OPTIONS.blogFeedUrl,
  };
}

export function sanitizeGenerateOptionsForPlan(
  raw: unknown,
  plan: UserPlan
): GenerateOptions {
  const options = normalizeGenerateOptions(raw);

  if (plan === 'pro') {
    return options;
  }

  return {
    ...DEFAULT_GENERATE_OPTIONS,
    includeBranding: true,
    workExperiences: [],
    wakatimeUsername: '',
    includeStreakStats: false,
    blogFeedUrl: '',
  };
}
