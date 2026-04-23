"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import PageWrapper from "@/components/ui/PageWrapper";
import { SkeletonLine, SkeletonCard } from "@/components/ui/Skeleton";

interface PatientDetail {
  pId: string; name: string; age: number; bloodGroup: string;
  gender: string; phone: string; email: string;
}
interface HistoryRecord { date: string; healthCondition: string; treatment: string; type: string; }

function PatientDetailSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="space-y-2">
          <SkeletonLine className="w-48 h-6" />
          <SkeletonLine className="w-28" />
        </div>
      </div>
      <div className="card p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[0,1,2,3,4].map(i => <SkeletonCard key={i} className="h-16" />)}
        </div>
      </div>
      <div className="card p-6 space-y-3">
        <SkeletonLine className="w-32 h-5" />
        {[0,1,2].map(i => <SkeletonCard key={i} className="h-12" />)}
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { pId } = useParams<{ pId: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    api(`/api/doctor/${s.id}/patients/${pId}`)
      .then((data: { patient: PatientDetail; history: HistoryRecord[] }) => {
        setPatient(data.patient); setHistory(data.history);
      }).finally(() => setLoading(false));
  }, [pId]);

  if (loading) return <div className="p-8"><PatientDetailSkeleton /></div>;
  if (!patient) return <div className="p-8 text-[#3d6b3d]">Patient not found</div>;

  const infoItems = [
    ["Age", `${patient.age} years`],
    ["Blood Group", patient.bloodGroup],
    ["Gender", patient.gender],
    ["Phone", patient.phone],
    ["Email", patient.email],
  ];

  return (
    <PageWrapper>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push("/doctor/patients")}
          className="text-[#6aaa6a] hover:text-green-400 transition-colors active:scale-95 inline-block"
        >
          My Patients
        </button>
        <span className="text-[#3d6b3d]">/</span>
        <span className="text-[#e8f5e8] font-medium">{patient.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">{patient.name}</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">Patient Profile</p>
      </div>

      {/* Info grid */}
      <div className="card p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {infoItems.map(([label, value]) => (
            <div key={label} className="bg-[#080e08] border border-[#1e321e] rounded-xl p-3 hover:border-[#254525] transition-colors">
              <p className="text-xs text-[#3d6b3d] mb-1">{label}</p>
              <p className="text-[#e8f5e8] text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e321e] flex items-center gap-2">
          <span className="text-green-400">📋</span>
          <h2 className="text-[#e8f5e8] font-semibold">Medical History</h2>
          <span className="ml-auto text-xs text-[#3d6b3d]">{history.length} records</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e321e]">
              {["Date", "Condition", "Treatment", "Type"].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0
              ? <tr><td colSpan={4} className="px-6 py-12 text-center text-[#3d6b3d]">No history records</td></tr>
              : history.map((r, i) => (
                <tr key={i} className="table-row">
                  <td className="px-6 py-4 text-[#6aaa6a]">{r.date}</td>
                  <td className="px-6 py-4 text-[#e8f5e8] font-medium">{r.healthCondition}</td>
                  <td className="px-6 py-4 text-[#6aaa6a]">{r.treatment}</td>
                  <td className="px-6 py-4"><span className="badge-type">{r.type}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
