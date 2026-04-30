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

export interface GeneratedContent {
  bio: string;
  readme: string;
  skills: string;
  sponsorPitch: string;
}

export type TabKey = 'bio' | 'readme' | 'skills' | 'sponsor';

export interface GenerateResponse {
  githubData: GitHubData;
  content: GeneratedContent;
}
