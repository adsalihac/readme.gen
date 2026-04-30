'use client';

interface HeroProps {
  onOpenModal: () => void;
}

export function Hero({ onOpenModal }: HeroProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 text-center animate-fade-in">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        AI-powered · GitHub-integrated · Free to try
      </div>

      {/* Headline */}
      <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Build a GitHub profile
        <span className="block text-gray-900">
          that stands out
        </span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-500">
        Enter your GitHub username. Get a polished README, bio, skill badges,
        and sponsor pitch - crafted by AI in seconds.
      </p>

      {/* CTA button */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2.5 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-700 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-gray-400/50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Readme
        </button>
        <span className="text-sm text-gray-400">No sign-up required</span>
      </div>

     
    </section>
  );
}
