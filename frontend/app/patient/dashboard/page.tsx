"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";

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

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  const h = new Date().getHours();
  const greeting = `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${name}`;

  const stats = [
    { label: "Upcoming Appointments", value: data?.upcoming ?? 0, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Pending Requests", value: data?.pending ?? 0, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Total Visits", value: data?.total ?? 0, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{greeting} 👋</h1>
        <p className="text-[#94a3b8] mt-1">Here&apos;s your health overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} border border-[#2a2d3a] rounded-2xl p-6`}>
            <p className="text-[#94a3b8] text-sm">{s.label}</p>
            <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-[#f1f5f9] font-semibold mb-4">Upcoming Appointments</h2>
          {!data?.upcomingAppointments.length
            ? <p className="text-[#94a3b8] text-sm">No upcoming appointments</p>
            : <div className="space-y-3">
                {data.upcomingAppointments.map(a => (
                  <div key={a.aId} className="flex items-center justify-between p-3 bg-[#0f1117] rounded-xl">
                    <div>
                      <p className="text-[#f1f5f9] text-sm font-medium">{a.doctorName}</p>
                      <p className="text-[#94a3b8] text-xs">{a.doctorDepartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#f1f5f9] text-xs">{a.date}</p>
                      <p className="text-[#94a3b8] text-xs">{a.startTime} – {a.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-[#f1f5f9] font-semibold mb-4">Pending Requests</h2>
          {!data?.pendingRequests.length
            ? <p className="text-[#94a3b8] text-sm">No pending requests</p>
            : <div className="flex flex-wrap gap-2">
                {data.pendingRequests.map(r => (
                  <span key={r.dId} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">
                    {r.doctorName} · {r.doctorDepartment}
                  </span>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
