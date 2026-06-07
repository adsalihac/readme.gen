'use client';

import type { CurrentUser, UserPlan } from '@/lib/entitlements';

interface PricingProps {
  checkoutState: 'idle' | 'loading';
  plan: UserPlan;
  user: CurrentUser | null;
  onCheckout: () => void;
  onSignIn: () => void;
  onStartGenerating: () => void;
}

export function Pricing({
  checkoutState,
  plan,
  user,
  onCheckout,
  onSignIn,
  onStartGenerating,
}: Readonly<PricingProps>) {
  const freeFeatures = [
    'Unlimited profile generation',
    'Standard layouts & styles',
    'GitHub Stats & Streak cards',
    'Skills badge generator',
    'Manual commits to GitHub',
  ];

  const proFeatures = [
    'Everything in Free',
    'Voice style and advanced insight controls',
    'Sponsor narrative and richer profile sections',
    'Work experience, WakaTime, blog, and streak integrations',
    'No "readme.gen" footer branding',
    'Deploy tab for direct GitHub README updates',
    'All future Pro v1 improvements',
  ];

  return (
    <section id="pricing" className="relative scroll-mt-14 border-t border-gray-100 bg-gray-50/50 py-16 sm:py-20">
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Empower your GitHub profile
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate a clean README for free forever, or upgrade once through Polar to unlock advanced controls, integrations, no-branding output, and direct deploy.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-10 grid max-w-sm grid-cols-1 gap-y-10 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8">
          
          {/* Free Tier Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 sm:p-10">
            <div>
              <h3 id="tier-hobby" className="text-base font-semibold leading-7 text-gray-900">
                Free Tier
              </h3>
              <div className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$0</span>
                <span className="text-sm font-semibold leading-6 text-gray-500">forever</span>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Perfect for developers who want a quick, clean profile README without recurring costs.
              </p>
              <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-gray-600">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
                <li className="flex gap-x-3 text-gray-400">
                  <svg className="h-6 w-5 flex-none text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Includes &quot;readme.gen&quot; footer branding
                </li>
              </ul>
            </div>
            <button
              onClick={onStartGenerating}
              className="mt-8 block rounded-full border border-gray-900 bg-transparent px-3 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              Start Generating Free
            </button>
          </div>

          {/* Pro Tier Card */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-transparent bg-white p-8 shadow-md ring-2 ring-indigo-600 sm:p-10">
            {/* Glow effect */}
            <div className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-sm" />
            
            <div className="absolute -top-4 right-8 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
              Most Popular
            </div>

            <div>
              <h3 id="tier-pro" className="text-base font-semibold leading-7 text-indigo-600">
                Pro Developer
              </h3>
              <div className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$5</span>
                <span className="text-sm font-semibold leading-6 text-gray-500">one-time payment</span>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Checkout is handled securely by Polar, and Pro access activates automatically after the payment webhook is received.
              </p>
              <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-gray-600">
                {proFeatures.map((feature, idx) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className={idx === 0 ? 'font-medium text-gray-900' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={plan === 'pro' ? undefined : user ? onCheckout : onSignIn}
              disabled={plan === 'pro' || checkoutState === 'loading'}
              className="mt-8 block rounded-full bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {plan === 'pro'
                ? 'Pro Active'
                : checkoutState === 'loading'
                  ? 'Opening Checkout...'
                  : user
                    ? 'Upgrade to Pro'
                    : 'Sign in to Upgrade'}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
