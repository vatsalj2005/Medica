"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface DashboardData {
  today: number; completed: number; uniquePatients: number;
  todaySchedule: { aId: string; startTime: string; endTime: string; patientName: string; patientAge: number; patientBloodGroup: string }[];
}

export default function DoctorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setName(s.name);
    api(`/api/doctor/${s.id}/dashboard`).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><SkeletonDashboard /></div>;

  const stats = [
    { label: "Today's Appointments", value: data?.today ?? 0,          color: "text-green-400",   bg: "bg-green-500/8  border-green-500/20" },
    { label: "Total Completed",      value: data?.completed ?? 0,      color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
    { label: "Unique Patients",      value: data?.uniquePatients ?? 0, color: "text-teal-400",    bg: "bg-teal-500/8   border-teal-500/20" },
  ];

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">Welcome, {name} 👋</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">Here&apos;s your schedule overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-card border ${s.bg}`} style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[#6aaa6a] text-sm">{s.label}</p>
            <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-[#e8f5e8] font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-400">📅</span> Today&apos;s Schedule
        </h2>
        {!data?.todaySchedule.length
          ? <p className="text-[#3d6b3d] text-sm">No appointments scheduled for today</p>
          : <div className="space-y-2">
              {data.todaySchedule.map(a => (
                <div key={a.aId} className="flex items-center justify-between p-4 bg-[#080e08] border border-[#1e321e] rounded-xl hover:border-[#254525] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center text-sm shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="text-[#e8f5e8] text-sm font-medium">{a.patientName}</p>
                      <p className="text-[#6aaa6a] text-xs">Age {a.patientAge} · {a.patientBloodGroup}</p>
                    </div>
                  </div>
                  <span className="badge-scheduled">{a.startTime} – {a.endTime}</span>
                </div>
              ))}
            </div>
        }
      </div>
    </PageWrapper>
  );
}
