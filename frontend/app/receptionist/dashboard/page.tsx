"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DashboardData {
  pending: number; today: number; weekCompleted: number;
  recentRequests: { pId: string; dId: string; patientName: string; doctorName: string; doctorDepartment: string }[];
}

export default function ReceptionistDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/receptionist/dashboard").then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  const stats = [
    { label: "Pending Requests", value: data?.pending ?? 0, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Today's Appointments", value: data?.today ?? 0, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Completed This Week", value: data?.weekCompleted ?? 0, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Receptionist Dashboard</h1>
        <p className="text-[#94a3b8] mt-1">Manage appointments and requests</p>
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
        <h2 className="text-[#f1f5f9] font-semibold mb-4">Recent Requests</h2>
        {!data?.recentRequests.length
          ? <p className="text-[#94a3b8] text-sm">No recent requests</p>
          : <div className="space-y-3">
              {data.recentRequests.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0f1117] rounded-xl">
                  <div>
                    <p className="text-[#f1f5f9] text-sm font-medium">{r.patientName}</p>
                    <p className="text-[#94a3b8] text-xs">Requesting appointment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#f1f5f9] text-sm">{r.doctorName}</p>
                    <p className="text-[#94a3b8] text-xs">{r.doctorDepartment}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
