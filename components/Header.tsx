'use client';

import Link from 'next/link';
import type { CurrentUser, UserPlan } from '@/lib/entitlements';

interface HeaderProps {
  user: CurrentUser | null;
  plan: UserPlan;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Header({
  user,
  plan,
  onSignIn,
  onSignOut,
}: Readonly<HeaderProps>) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm font-semibold text-gray-900">
            readme.gen
          </span>
        </Link>

       

        {/* Actions */}
        <div className="flex items-center gap-2">

             {/* Pricing Link */}
          <a
            href="#pricing"
            className="mr-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Pricing
          </a>
          {user ? (
            <>
              <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 sm:inline-flex">
                {plan === 'pro' ? 'Pro' : 'Starter'}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="hidden rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Sign in
            </button>
          )}

        

        
        </div>
      </div>
    </header>
  );
}
