"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [warming, setWarming] = useState(true);

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    fetch(`${BASE}/api/auth/ping`, { method: "GET" })
      .catch(() => {})
      .finally(() => setWarming(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession({ role: data.role, id: data.id, name: data.name, email: data.email });
      router.push(`/${data.role}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080e08] px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="bg-[#0f1a0f] border border-[#1e321e] rounded-2xl shadow-2xl shadow-black/60 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h1 className="text-3xl font-bold text-[#e8f5e8]">Medica</h1>
            <p className="text-[#6aaa6a] mt-1 text-sm">Sign in to your account</p>
          </div>

          {/* Warming banner */}
          {warming && (
            <div className="mb-5 p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-green-400 text-sm text-center flex items-center justify-center gap-2">
              <span className="animate-pulse-slow">⏳</span>
              Waking up server, please wait…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#e8f5e8] mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8f5e8] mb-2">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || warming}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {loading
                ? <><span className="animate-spin inline-block">⟳</span> Signing in…</>
                : warming
                  ? "Waiting for server…"
                  : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#6aaa6a] text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
