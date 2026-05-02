import Image from 'next/image';
import type { GitHubData, GitHubUser } from '@/types';

interface ProfileCardProps {
  githubData: GitHubData;
}

const STAT_ITEMS = (user: GitHubUser, totalStars: number) => [
  { label: 'Repos', value: user.public_repos },
  { label: 'Followers', value: user.followers.toLocaleString() },
  { label: 'Stars', value: totalStars.toLocaleString() },
];

function yearsSince(dateString: string): number {
  const started = new Date(dateString).getTime();
  if (!Number.isFinite(started)) return 0;
  return Math.max(0, (Date.now() - started) / (1000 * 60 * 60 * 24 * 365.25));
}

export function ProfileCard({ githubData }: Readonly<ProfileCardProps>) {
  const { user, totalStars, repos, languages } = githubData;
  const repoCount = Math.max(user.public_repos, repos.length, 1);
  const starsPerRepo = totalStars / repoCount;
  const followerRepoRatio = user.followers / repoCount;
  const accountYears = yearsSince(user.created_at);
  const topLanguage =
    Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Mixed';

  const insightItems = [
    {
      label: 'Influence',
      value: `${followerRepoRatio.toFixed(1)} followers/repo`,
    },
    {
      label: 'Star Velocity',
      value: `${starsPerRepo.toFixed(1)} stars/repo`,
    },
    {
      label: 'Tenure',
      value: `${Math.max(1, Math.floor(accountYears))} years on GitHub`,
    },
    {
      label: 'Primary Stack',
      value: topLanguage,
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-slide-up">
      <div className="flex items-center gap-4">
        <Image
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          width={56}
          height={56}
          className="flex-shrink-0 rounded-full ring-2 ring-gray-200"
          unoptimized
        />
        <div className="flex-1 min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">
            {user.name ?? user.login}
          </p>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            @{user.login}
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-6 pr-2">
          {STAT_ITEMS(user, totalStars).map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {insightItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
