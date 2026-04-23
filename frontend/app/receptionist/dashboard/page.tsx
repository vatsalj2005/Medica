"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

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

  if (loading) return <div className="p-8"><SkeletonDashboard /></div>;

  const stats = [
    { label: "Pending Requests",      value: data?.pending ?? 0,       color: "text-yellow-400", bg: "bg-yellow-500/8  border-yellow-500/20" },
    { label: "Today's Appointments",  value: data?.today ?? 0,         color: "text-green-400",  bg: "bg-green-500/8   border-green-500/20" },
    { label: "Completed This Week",   value: data?.weekCompleted ?? 0, color: "text-emerald-400",bg: "bg-emerald-500/8  border-emerald-500/20" },
  ];

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">Receptionist Dashboard</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">Manage appointments and requests</p>
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
          <span className="text-yellow-400">📨</span> Recent Requests
        </h2>
        {!data?.recentRequests.length
          ? <p className="text-[#3d6b3d] text-sm">No recent requests</p>
          : <div className="space-y-2">
              {data.recentRequests.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#080e08] border border-[#1e321e] rounded-xl hover:border-[#254525] transition-colors">
                  <div>
                    <p className="text-[#e8f5e8] text-sm font-medium">{r.patientName}</p>
                    <p className="text-[#6aaa6a] text-xs">Requesting appointment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#e8f5e8] text-sm">{r.doctorName}</p>
                    <p className="text-[#6aaa6a] text-xs">{r.doctorDepartment}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </PageWrapper>
  );
}
