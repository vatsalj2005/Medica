"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";

interface Patient { pId: string; name: string; age: number; bloodGroup: string; gender: string; phone: string; }

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    api(`/api/doctor/${s.id}/patients`).then(setPatients).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">My Patients</h1>
        <p className="text-[#94a3b8] mt-1">{patients.length} patient{patients.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Name", "Age", "Blood Group", "Gender", "Phone", ""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.length === 0
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No patients found</td></tr>
              : patients.map(p => (
                <tr key={p.pId} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/doctor/patients/${p.pId}`)}>
                  <td className="px-6 py-4 text-[#f1f5f9] font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{p.age}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs">{p.bloodGroup}</span>
                  </td>
                  <td className="px-6 py-4 text-[#94a3b8]">{p.gender}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{p.phone}</td>
                  <td className="px-6 py-4 text-indigo-400 text-xs">View →</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
