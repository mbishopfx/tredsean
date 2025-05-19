'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tech-background">
      <div className="w-full max-w-md space-y-8 p-10 bg-glass rounded-xl shadow-tech z-10 tech-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Something went wrong!</h1>
          <div className="mt-4 p-4 bg-status-danger bg-opacity-10 border border-status-danger border-opacity-30 rounded-md text-status-danger">
            {error.message || 'An unexpected error occurred'}
          </div>
          <p className="mt-4 text-gray-400">
            Please try again or contact support if the problem persists.
          </p>
          <button
            onClick={reset}
            className="mt-6 px-4 py-2 bg-gradient text-white rounded-md hover:shadow-accent transition-shadow duration-300"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
} 