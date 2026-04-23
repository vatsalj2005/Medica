"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", age: "", bloodGroup: "", gender: "",
    email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
      router.push("/login");
    } catch (err: any) {
      try { setErrors(JSON.parse(err.message)); } catch { setErrors({ general: err.message }); }
      setLoading(false);
    }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div key={key}>
      <label className="block text-sm font-medium text-[#e8f5e8] mb-2">{label}</label>
      <input
        type={type}
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="input"
      />
      {errors[key] && <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080e08] px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-900/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-up">
        <div className="bg-[#0f1a0f] border border-[#1e321e] rounded-2xl shadow-2xl shadow-black/60 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-[#e8f5e8]">Patient Registration</h1>
            <p className="text-[#6aaa6a] mt-1 text-sm">Create your Medica account</p>
          </div>

          {errors.general && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">{field("Full Name", "name", "text", "John Doe")}</div>
              {field("Age", "age", "number", "25")}

              <div>
                <label className="block text-sm font-medium text-[#e8f5e8] mb-2">Blood Group</label>
                <select
                  value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}
                  className="input"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bloodGroup && <p className="mt-1.5 text-xs text-red-400">{errors.bloodGroup}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e8f5e8] mb-2">Gender</label>
                <select
                  value={form.gender} onChange={e => set("gender", e.target.value)}
                  className="input"
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <p className="mt-1.5 text-xs text-red-400">{errors.gender}</p>}
              </div>

              {field("Phone", "phone", "tel", "1234567890")}
              <div className="md:col-span-2">{field("Email", "email", "email", "you@example.com")}</div>
              {field("Password", "password", "password", "••••••••")}
              {field("Confirm Password", "confirmPassword", "password", "••••••••")}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading
                ? <><span className="animate-spin inline-block">⟳</span> Creating Account…</>
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#6aaa6a] text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
