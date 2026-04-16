'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl hover-lift">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
            <AlertTriangle className="w-10 h-10 text-error" strokeWidth={2} />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-text-primary mb-2">Something went wrong</h1>
          <p className="text-text-muted mb-8">
            An unexpected error occurred. Please try again or contact support if the problem
            persists.
          </p>

          {/* Retry Button */}
          <button
            onClick={reset}
            className="w-full px-6 py-3.5 gradient-primary text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-glow-md hover:scale-105 active:scale-95 ripple mb-4"
          >
            Try Again
          </button>

          {/* Back to Home */}
          <a
            href="/login"
            className="block text-sm text-text-muted hover:text-primary transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
