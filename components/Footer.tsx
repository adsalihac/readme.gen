const REPO_URL = 'https://github.com/adsalihac/Github-Readme-Generator';

const LINKS = [
  { label: 'GitHub', href: REPO_URL },
  { label: 'Issues', href: `${REPO_URL}/issues` },
  { label: 'Contribute', href: `${REPO_URL}/contribute` },
  { label: 'License', href: `${REPO_URL}/blob/main/LICENSE` },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        {/* Single row: branding left · links center · follow right */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Left: logo + name */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">readme.gen</span>
          </div>

          {/* Center: nav links */}
          <nav className="flex items-center gap-4">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: follow + copyright inline */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/adsalihac"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              @adsalihac
            </a>
            <span className="text-xs text-gray-300">·</span>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()}</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
