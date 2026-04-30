import Link from 'next/link';

const REPO_URL = 'https://github.com/adsalihac/readme.gen';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm font-semibold text-gray-900">
            readme<span className="text-gray-900">.gen</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Star on GitHub */}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          >
            <svg
              className="h-3.5 w-3.5 text-amber-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Star
          </a>

          {/* Contribute */}
          <a
            href={`${REPO_URL}/contribute`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-gray-700"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Contribute
          </a>
        </div>
      </div>
    </header>
  );
}
