import type { GitHubData, GitHubRepo, GitHubUser } from '@/types';

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  };

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 300 },
    }),
    fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=stars`,
      {
        headers,
        next: { revalidate: 300 },
      }
    ),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 404) throw new Error(`GitHub user "${username}" not found`);
    if (userRes.status === 403) throw new Error('GitHub API rate limit exceeded. Add a GITHUB_TOKEN to increase limits.');
    throw new Error('Failed to fetch GitHub profile');
  }

  const user: GitHubUser = await userRes.json();
  const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

  // Tally language usage across repos
  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] ?? 0) + 1;
    }
  }

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  return {
    user,
    repos: repos.slice(0, 10),
    languages,
    totalStars,
  };
}
