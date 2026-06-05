'use client';

import { useState } from 'react';

interface PricingProps {
  onStartGenerating: () => void;
}

export function Pricing({ onStartGenerating }: PricingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        setIsModalOpen(false);
      }, 3000);
    }
  };

  const freeFeatures = [
    'Unlimited profile generation',
    'Standard layouts & styles',
    'GitHub Stats & Streak cards',
    'Skills badge generator',
    'Manual commits to GitHub',
  ];

  const proFeatures = [
    'Everything in Free',
    'AI-Tailored rewrites (recruiter-ready)',
    'Dynamic live Spotify widget',
    'GitHub App automatic daily sync',
    'Premium header banner generator',
    'No "readme.gen" branding logo',
    'Priority updates & support',
  ];

  return (
    <section id="pricing" className="relative border-t border-gray-100 bg-gray-50/50 py-24 sm:py-32">
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
            Generate your basic README for free forever, or upgrade to Pro to unlock advanced AI personalizations, automated sync, and premium graphics.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-y-10 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8">
          
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
                  Includes "readme.gen" footer branding
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
                For professionals looking to build a stellar personal brand and stand out to top recruiters.
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
              onClick={() => setIsModalOpen(true)}
              className="mt-8 block rounded-full bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20"
            >
              Get Pro Access
            </button>
          </div>

        </div>
      </div>

      {/* Waitlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-scale-up">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                🚀
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Join the Pro Waitlist</h3>
              <p className="mt-2 text-sm text-gray-500">
                We are actively building our Premium AI tailoring, dynamic Spotify integration, and auto-sync features. Join the waitlist today and get **50% off** at launch!
              </p>
            </div>

            {isSubmitted ? (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center border border-emerald-100 animate-scale-up">
                <span className="text-xs font-semibold text-emerald-800">🎉 You're on the list! Thank you!</span>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                  <input
                    id="waitlist-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 active:scale-[0.98] transition-all"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
