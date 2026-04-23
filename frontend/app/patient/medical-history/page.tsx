"use client";
import { useEffect, useState, useRef } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

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

  return (
    <PageWrapper>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#e8f5e8]">Medical History</h1>
          <p className="text-[#6aaa6a] mt-1 text-sm">
            {loading ? "Loading…" : `${records.length} record${records.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d6b3d] text-sm">🔍</span>
          <input
            type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by condition…"
            className="input pl-9 w-64 py-2.5 text-sm"
          />
        </div>
      </div>

      {loading ? <SkeletonTable rows={5} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e321e]">
                {["Date", "Condition", "Treatment", "Type", "Doctor", "Department"].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0
                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-[#3d6b3d]">No records found</td></tr>
                : records.map((r, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-6 py-4 text-[#6aaa6a]">{r.date}</td>
                    <td className="px-6 py-4 text-[#e8f5e8] font-medium">{r.healthCondition}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{r.treatment}</td>
                    <td className="px-6 py-4"><span className="badge-type">{r.type}</span></td>
                    <td className="px-6 py-4 text-[#e8f5e8]">{r.doctorName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{r.doctorDepartment}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
