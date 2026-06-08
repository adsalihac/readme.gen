'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession, signIn, signOut } from 'next-auth/react';
import { Hero } from '@/components/Hero';
import { Pricing } from '@/components/Pricing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GenerateModal } from '@/components/GenerateModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ResultTabs } from '@/components/ResultTabs';
import { ProfileCard } from '@/components/ProfileCard';
import { DEFAULT_GENERATE_OPTIONS, type GenerateOptions, type GenerateResponse } from '@/types';
import type { CurrentUser, UserPlan } from '@/lib/entitlements';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [plan, setPlan] = useState<UserPlan>('free');
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading'>('idle');
  const [generationOptions, setGenerationOptions] =
    useState<GenerateOptions>(DEFAULT_GENERATE_OPTIONS);

  const loadAccount = useCallback(async () => {
    try {
      const session = await getSession();
      const sessionUser = session?.user?.id
        ? {
            id: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
          }
        : null;

      setCurrentUser(sessionUser);

      if (!sessionUser) {
        setPlan('free');
        return;
      }

      const res = await fetch('/api/me');
      if (!res.ok) return;

      const data = (await res.json()) as {
        user: CurrentUser | null;
        plan: UserPlan;
      };
      setCurrentUser(data.user ?? sessionUser);
      setPlan(data.plan === 'pro' ? 'pro' : 'free');
    } catch {
      // Keep the current session visible if the slower account/plan check fails.
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAccount();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAccount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get('checkoutId') ?? params.get('checkout_id');

    if (!checkoutId) return;

    let cancelled = false;

    const syncCheckout = async () => {
      try {
        const res = await fetch('/api/polar/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;

          if (!cancelled) {
            setError(data?.error ?? 'Your upgrade is still being verified.');
          }
          return;
        }
        if (!cancelled) {
          setPlan('pro');
          await loadAccount();
        }
      } catch {
        // Webhooks remain the source of truth; this only helps local/sandbox redirects.
      }
    };

    void syncCheckout();

    return () => {
      cancelled = true;
    };
  }, [loadAccount]);

  const handleSignIn = () => {
    void signIn('github');
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: '/' });
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      handleSignIn();
      return;
    }

    setCheckoutState('loading');
    setError('');
    window.location.assign('/api/checkout');
  };

  const handleGenerate = async (username: string, options: GenerateOptions) => {
    setCurrentUsername(username);
    setGenerationOptions(options);
    setAppState('loading');
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, options }),
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
    if (currentUsername) handleGenerate(currentUsername, generationOptions);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header
        user={currentUser}
        plan={plan}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <GenerateModal
        isOpen={isModalOpen}
        plan={plan}
        onUpgrade={handleCheckout}
        onClose={() => setIsModalOpen(false)}
        onGenerate={(username, options) => {
          setIsModalOpen(false);
          handleGenerate(username, options);
        }}
      />

      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Subtle top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-gray-50 to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* ─── Idle: landing hero + pricing ─── */}
          {appState === 'idle' && (
            <>
              <Hero onOpenModal={() => setIsModalOpen(true)} />
              <Pricing
                checkoutState={checkoutState}
                plan={plan}
                user={currentUser}
                onCheckout={handleCheckout}
                onSignIn={handleSignIn}
                onStartGenerating={() => setIsModalOpen(true)}
              />
            </>
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
                githubData={result.githubData}
              />

              <ResultTabs
                content={result.content}
                options={result.optionsUsed}
                plan={plan}
                onUpgrade={handleCheckout}
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
