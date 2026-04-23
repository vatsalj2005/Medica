"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";

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

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  const stats = [
    { label: "Today's Appointments", value: data?.today ?? 0, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Total Completed", value: data?.completed ?? 0, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Unique Patients", value: data?.uniquePatients ?? 0, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Welcome, {name} 👋</h1>
        <p className="text-[#94a3b8] mt-1">Here&apos;s your schedule overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} border border-[#2a2d3a] rounded-2xl p-6`}>
            <p className="text-[#94a3b8] text-sm">{s.label}</p>
            <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
        <h2 className="text-[#f1f5f9] font-semibold mb-4">Today&apos;s Schedule</h2>
        {!data?.todaySchedule.length
          ? <p className="text-[#94a3b8] text-sm">No appointments scheduled for today</p>
          : <div className="space-y-3">
              {data.todaySchedule.map(a => (
                <div key={a.aId} className="flex items-center justify-between p-4 bg-[#0f1117] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-sm">👤</div>
                    <div>
                      <p className="text-[#f1f5f9] text-sm font-medium">{a.patientName}</p>
                      <p className="text-[#94a3b8] text-xs">Age {a.patientAge} · {a.patientBloodGroup}</p>
                    </div>
                  </div>
                  <p className="text-indigo-400 text-sm font-medium">{a.startTime} – {a.endTime}</p>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
