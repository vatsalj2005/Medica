"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface DashboardData {
  upcoming: number; pending: number; total: number;
  upcomingAppointments: { aId: string; date: string; startTime: string; endTime: string; doctorName: string; doctorDepartment: string }[];
  pendingRequests: { dId: string; doctorName: string; doctorDepartment: string }[];
}

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setName(s.name);
    api(`/api/patient/${s.id}/dashboard`).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><SkeletonDashboard /></div>;

  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Upcoming Appointments", value: data?.upcoming ?? 0, color: "text-green-400",  bg: "bg-green-500/8  border-green-500/20",  glow: "shadow-green-900/20" },
    { label: "Pending Requests",      value: data?.pending ?? 0,  color: "text-yellow-400", bg: "bg-yellow-500/8 border-yellow-500/20", glow: "shadow-yellow-900/20" },
    { label: "Total Visits",          value: data?.total ?? 0,    color: "text-emerald-400",bg: "bg-emerald-500/8 border-emerald-500/20",glow: "shadow-emerald-900/20" },
  ];

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">{greeting}, {name} 👋</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">Here&apos;s your health overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`stat-card border ${s.bg} shadow-lg ${s.glow}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-[#6aaa6a] text-sm">{s.label}</p>
            <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="card p-6">
          <h2 className="text-[#e8f5e8] font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-400">📅</span> Upcoming Appointments
          </h2>
          {!data?.upcomingAppointments.length
            ? <p className="text-[#3d6b3d] text-sm">No upcoming appointments</p>
            : <div className="space-y-2">
                {data.upcomingAppointments.map(a => (
                  <div key={a.aId} className="flex items-center justify-between p-3 bg-[#080e08] rounded-xl border border-[#1e321e] hover:border-[#254525] transition-colors">
                    <div>
                      <p className="text-[#e8f5e8] text-sm font-medium">{a.doctorName}</p>
                      <p className="text-[#6aaa6a] text-xs">{a.doctorDepartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#e8f5e8] text-xs">{a.date}</p>
                      <p className="text-[#6aaa6a] text-xs">{a.startTime} – {a.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Pending */}
        <div className="card p-6">
          <h2 className="text-[#e8f5e8] font-semibold mb-4 flex items-center gap-2">
            <span className="text-yellow-400">⏳</span> Pending Requests
          </h2>
          {!data?.pendingRequests.length
            ? <p className="text-[#3d6b3d] text-sm">No pending requests</p>
            : <div className="flex flex-wrap gap-2">
                {data.pendingRequests.map(r => (
                  <span key={r.dId} className="badge-requested">
                    {r.doctorName} · {r.doctorDepartment}
                  </span>
                ))}
              </div>
          }
        </div>
      </div>
    </PageWrapper>
  );
}
