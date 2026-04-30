interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="w-full max-w-md px-4 text-center animate-slide-up">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-100">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Something went wrong
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">{message}</p>
        <button
          onClick={onRetry}
          className="mt-8 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.97]"
        >
          ← Try another username
        </button>
      </div>
    </div>
  );
}
