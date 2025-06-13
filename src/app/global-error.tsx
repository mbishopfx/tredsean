'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-tech-background">
          <div className="w-full max-w-md space-y-8 p-10 bg-glass rounded-xl shadow-tech z-10 tech-border">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-500">Critical Error</h1>
              <div className="mt-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-md text-red-500">
                {error.message || 'A critical error occurred'}
              </div>
              <p className="mt-4 text-gray-400">
                The application has encountered a critical error. Please try refreshing the page.
              </p>
              <button
                onClick={reset}
                className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 