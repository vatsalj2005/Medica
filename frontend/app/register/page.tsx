"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const GENDERS = ["Male","Female","Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", age:"", bloodGroup:"", gender:"", email:"", phone:"", password:"", confirmPassword:"" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ""})); };

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
      <label className="block text-sm font-medium text-[#f1f5f9] mb-2">{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-white placeholder-[#94a3b8] focus:outline-none focus:border-indigo-500 transition-all" />
      {errors[key] && <p className="mt-1 text-sm text-red-400">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-[#1a1d27] rounded-2xl border border-[#2a2d3a] shadow-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Patient Registration</h1>
            <p className="text-[#94a3b8] mt-1">Create your Medica account</p>
          </div>

          {errors.general && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">{field("Full Name", "name", "text", "John Doe")}</div>
              {field("Age", "age", "number", "25")}

              <div>
                <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Blood Group</label>
                <select value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bloodGroup && <p className="mt-1 text-sm text-red-400">{errors.bloodGroup}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Gender</label>
                <select value={form.gender} onChange={e => set("gender", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="">Select Gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
              </div>

              {field("Phone", "phone", "tel", "1234567890")}
              <div className="md:col-span-2">{field("Email", "email", "email", "you@example.com")}</div>
              {field("Password", "password", "password", "••••••••")}
              {field("Confirm Password", "confirmPassword", "password", "••••••••")}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
              {loading ? <><span className="animate-spin">⟳</span> Creating Account...</> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#94a3b8] text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
