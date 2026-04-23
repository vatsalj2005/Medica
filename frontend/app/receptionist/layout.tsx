"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession, AuthSession } from "@/lib/auth";

const navLinks = [
  { href: "/receptionist/dashboard",    label: "Dashboard",              icon: "⊞" },
  { href: "/receptionist/requests",     label: "Appointment Requests",   icon: "📨" },
  { href: "/receptionist/appointments", label: "All Appointments",       icon: "📅" },
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

  const initials = session.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#080e08]">
      <aside className="w-64 bg-[#0f1a0f] border-r border-[#1e321e] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#1e321e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-lg shrink-0">
              🗂️
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#3d6b3d] font-semibold">Receptionist</p>
              <p className="text-sm font-semibold text-[#e8f5e8] truncate">{session.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navLinks.map(link => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                <span className="text-base w-5 text-center shrink-0">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1e321e] space-y-1">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl">
            <div className="w-8 h-8 bg-green-700/30 border border-green-700/40 rounded-lg flex items-center justify-center text-xs font-bold text-green-300 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#e8f5e8] truncate">{session.name}</p>
              <p className="text-[10px] text-[#3d6b3d] truncate">{session.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6aaa6a] hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 active:scale-[0.98]"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#080e08]">{children}</main>
    </div>
  );
}
