export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
}

export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  languages: Record<string, number>;
  totalStars: number;
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface GeneratedContent {
  bio: string;
  readme: string;
  skills: string;
  sponsorPitch: string;
  blogWorkflow?: string;
}

export type VoiceStyle = 'professional' | 'friendly' | 'bold';

export type InsightDepth = 'standard' | 'advanced';

export type SponsorNarrative = 'impact' | 'journey' | 'milestones';

export interface GenerateOptions {
  voiceStyle: VoiceStyle;
  insightDepth: InsightDepth;
  sponsorNarrative: SponsorNarrative;
  includeAchievements: boolean;
  includeCallToAction: boolean;
  workExperiences?: WorkExperience[];
  wakatimeUsername?: string;
  includeStreakStats?: boolean;
  blogFeedUrl?: string;
}

export const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  voiceStyle: 'professional',
  insightDepth: 'advanced',
  sponsorNarrative: 'impact',
  includeAchievements: true,
  includeCallToAction: true,
  workExperiences: [],
  wakatimeUsername: '',
  includeStreakStats: false,
  blogFeedUrl: '',
};

export type TabKey = 'bio' | 'readme' | 'skills' | 'sponsor' | 'deploy';

export interface GenerateResponse {
  githubData: GitHubData;
  content: GeneratedContent;
  optionsUsed: GenerateOptions;
}
