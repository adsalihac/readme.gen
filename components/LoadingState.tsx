export function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 animate-fade-in">
      {/* Step indicator */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500 animate-pulse">
            Fetching GitHub data and crafting your profile…
          </span>
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Fetching repos
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-violet-500 animate-pulse" />
            Generating content
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            Building preview
          </span>
        </div>
      </div>

      {/* Profile card skeleton */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="h-3 w-20 rounded-md bg-gray-100" />
        </div>
        <div className="hidden sm:flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-10 rounded bg-gray-200" />
              <div className="h-3 w-8 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="mb-4 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 flex-1 rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm animate-pulse">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="mt-6 h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="mt-6 h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded bg-gray-200" />
      </div>
    </div>
  );
}
