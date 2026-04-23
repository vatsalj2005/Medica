"use client";
import { useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1d27] rounded-2xl border border-[#2a2d3a] shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-2xl mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Medica</h1>
            <p className="text-[#94a3b8] mt-1">Sign in to your account</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Email", type: "email", value: email, onChange: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", value: password, onChange: setPassword, placeholder: "••••••••" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-[#f1f5f9] mb-2">{f.label}</label>
                <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} required placeholder={f.placeholder}
                  className="w-full px-4 py-3 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-white placeholder-[#94a3b8] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⟳</span> Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#94a3b8] text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">Register as Patient</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
