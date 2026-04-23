"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession, AuthSession } from "@/lib/auth";

const navLinks = [
  { href: "/receptionist/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/receptionist/requests", label: "Appointment Requests", icon: "📨" },
  { href: "/receptionist/appointments", label: "All Appointments", icon: "📅" },
];

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "receptionist") { router.replace("/login"); return; }
    setSession(s);
  }, [router]);

  const handleLogout = () => { clearSession(); router.replace("/login"); };

  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      <aside className="w-64 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col">
        <div className="p-6 border-b border-[#2a2d3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-lg">🗂️</div>
            <div>
              <p className="text-xs text-[#94a3b8]">Receptionist</p>
              <p className="text-sm font-semibold text-[#f1f5f9] truncate max-w-[130px]">{session.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-indigo-600 text-white" : "text-[#94a3b8] hover:bg-[#2a2d3a] hover:text-[#f1f5f9]"}`}>
                <span>{link.icon}</span>{link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#2a2d3a]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-all">
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
