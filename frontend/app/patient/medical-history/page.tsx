"use client";
import { useEffect, useState, useRef } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";

interface HistoryRecord {
  date: string; healthCondition: string; treatment: string;
  type: string; doctorName: string; doctorDepartment: string;
}

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setPatientId(s.id);
    api(`/api/patient/${s.id}/medical-history`).then(setRecords).finally(() => setLoading(false));
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = value.trim()
        ? `/api/patient/${patientId}/medical-history?search=${encodeURIComponent(value)}`
        : `/api/patient/${patientId}/medical-history`;
      api(url).then(setRecords);
    }, 300);
  };

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Medical History</h1>
          <p className="text-[#94a3b8] mt-1">{records.length} record{records.length !== 1 ? "s" : ""}</p>
        </div>
        <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search records..."
          className="px-4 py-2.5 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] placeholder-[#94a3b8] text-sm focus:outline-none focus:border-indigo-500 w-64" />
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Date", "Condition", "Treatment", "Type", "Doctor", "Department"].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No records found</td></tr>
              : records.map((r, i) => (
                <tr key={i} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                  <td className="px-6 py-4 text-[#94a3b8]">{r.date}</td>
                  <td className="px-6 py-4 text-[#f1f5f9]">{r.healthCondition}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{r.treatment}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs">{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-[#f1f5f9]">{r.doctorName}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{r.doctorDepartment}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
