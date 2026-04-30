'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface GitHubSuggestion {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (username: string) => void;
}

export function GenerateModal({ isOpen, onClose, onGenerate }: GenerateModalProps) {
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState<GitHubSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens; reset form state on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setUsername('');
      setSuggestions([]);
      setActiveIndex(-1);
      setShowSuggestions(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=6`,
        { headers: { Accept: 'application/vnd.github+json' } }
      );
      if (!res.ok) throw new Error('GitHub search failed');
      const data = await res.json();
      const items: GitHubSuggestion[] = (data.items ?? []).map(
        (u: { login: string; avatar_url: string; html_url: string }) => ({
          login: u.login,
          avatar_url: u.avatar_url,
          html_url: u.html_url,
        })
      );
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    const clean = value.replace(/^@/, '');
    setUsername(clean);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(clean), 300);
  };

  const handleSelectSuggestion = (login: string) => {
    setUsername(login);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') handleSubmit();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelectSuggestion(suggestions[activeIndex].login);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Generate README</h2>
            <p className="text-xs text-gray-400 mt-0.5">Enter or search a GitHub username</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Search input */}
          <div className="relative">
            <div className="relative flex items-center">
              {/* GitHub icon */}
              <span className="absolute left-3.5 text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search GitHub username…"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200"
              />
              {/* Search spinner or clear */}
              <span className="absolute right-3.5">
                {isSearching ? (
                  <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : username ? (
                  <button
                    type="button"
                    onClick={() => { setUsername(''); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                    className="text-gray-400 hover:text-gray-700"
                    aria-label="Clear"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </span>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {suggestions.map((user, index) => (
                  <li key={user.login}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(user.login); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors rounded-full ${
                        index === activeIndex
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Image
                        src={user.avatar_url}
                        alt={user.login}
                        width={28}
                        height={28}
                        className="rounded-full border border-gray-200 flex-shrink-0"
                        unoptimized
                      />
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {user.login}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          github.com/{user.login}
                        </span>
                      </span>
                      <svg
                        className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Example chips */}
          <div className="mt-4">
            <p className="mb-2 text-xs text-gray-400">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {['adsalihac', 'expo', 'sindresorhus', 'yyx990803'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleSelectSuggestion(example)}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                >
                  @{example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400">No sign-up · Works with any public profile</p>
          <button
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
