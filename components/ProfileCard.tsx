import Image from 'next/image';
import type { GitHubUser } from '@/types';

interface ProfileCardProps {
  user: GitHubUser;
  totalStars: number;
}

const STAT_ITEMS = (user: GitHubUser, totalStars: number) => [
  { label: 'Repos', value: user.public_repos },
  { label: 'Followers', value: user.followers.toLocaleString() },
  { label: 'Stars', value: totalStars.toLocaleString() },
];

export function ProfileCard({ user, totalStars }: ProfileCardProps) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-slide-up">
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
  );
}
