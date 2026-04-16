import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl hover-lift">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
            <FileQuestion className="w-10 h-10 text-primary" strokeWidth={2} />
          </div>

          {/* 404 Number */}
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-text-muted mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Back Button */}
          <Link
            href="/login"
            className="inline-block px-6 py-3.5 gradient-primary text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-glow-md hover:scale-105 active:scale-95 ripple"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
