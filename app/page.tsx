'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GenerateModal } from '@/components/GenerateModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ResultTabs } from '@/components/ResultTabs';
import { ProfileCard } from '@/components/ProfileCard';
import type { GenerateResponse } from '@/types';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = async (username: string) => {
    setCurrentUsername(username);
    setAppState('loading');
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to generate profile');
      }

      setResult(data as GenerateResponse);
      setAppState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setResult(null);
    setError('');
  };

  const handleRegenerate = () => {
    if (currentUsername) handleGenerate(currentUsername);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header />

      <GenerateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={(username) => {
          setIsModalOpen(false);
          handleGenerate(username);
        }}
      />

      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Subtle top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-gray-50 to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* ─── Idle: landing hero ─── */}
          {appState === 'idle' && (
            <Hero onOpenModal={() => setIsModalOpen(true)} />
          )}

          {/* ─── Loading ─── */}
          {appState === 'loading' && (
            <div className="mx-auto flex flex-1 max-w-3xl flex-col items-center justify-center px-4 py-24">
              <LoadingState />
            </div>
          )}

          {/* ─── Results ─── */}
          {appState === 'success' && result && (
            <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-8">
              {/* Topbar */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  New username
                </button>

                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                  @{currentUsername}
                </span>
              </div>

              <ProfileCard
                user={result.githubData.user}
                totalStars={result.githubData.totalStars}
              />

              <ResultTabs
                content={result.content}
                onRegenerate={handleRegenerate}
              />
            </div>
          )}

          {/* ─── Error ─── */}
          {appState === 'error' && (
            <div className="flex flex-1 items-center justify-center px-4">
              <ErrorState message={error} onRetry={handleReset} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
