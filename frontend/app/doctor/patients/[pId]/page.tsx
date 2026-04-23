"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";

interface PatientDetail { pId: string; name: string; age: number; bloodGroup: string; gender: string; phone: string; email: string; }
interface HistoryRecord { date: string; healthCondition: string; treatment: string; type: string; }

export default function PatientDetailPage() {
  const { pId } = useParams<{ pId: string }>();
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

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;
  if (!patient) return <div className="p-8 text-[#94a3b8]">Patient not found</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{patient.name}</h1>
        <p className="text-[#94a3b8] mt-1">Patient Profile</p>
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[["Age", `${patient.age} years`], ["Blood Group", patient.bloodGroup], ["Gender", patient.gender], ["Phone", patient.phone], ["Email", patient.email]].map(([label, value]) => (
            <div key={label} className="bg-[#0f1117] rounded-xl p-3">
              <p className="text-xs text-[#94a3b8]">{label}</p>
              <p className="text-[#f1f5f9] text-sm font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2d3a]">
          <h2 className="text-[#f1f5f9] font-semibold">Medical History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Date", "Condition", "Treatment", "Type"].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0
              ? <tr><td colSpan={4} className="px-6 py-8 text-center text-[#94a3b8]">No history records</td></tr>
              : history.map((r, i) => (
                <tr key={i} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                  <td className="px-6 py-4 text-[#94a3b8]">{r.date}</td>
                  <td className="px-6 py-4 text-[#f1f5f9]">{r.healthCondition}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{r.treatment}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs">{r.type}</span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
