"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

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

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">My Patients</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">
          {loading ? "Loading…" : `${patients.length} patient${patients.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {loading ? <SkeletonTable rows={5} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e321e]">
                {["Name", "Age", "Blood Group", "Gender", "Phone", ""].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0
                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-[#3d6b3d]">No patients found</td></tr>
                : patients.map(p => (
                  <tr
                    key={p.pId}
                    className="table-row cursor-pointer"
                    onClick={() => router.push(`/doctor/patients/${p.pId}`)}
                  >
                    <td className="px-6 py-4 text-[#e8f5e8] font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{p.age}</td>
                    <td className="px-6 py-4"><span className="badge-blood">{p.bloodGroup}</span></td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{p.gender}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{p.phone}</td>
                    <td className="px-6 py-4 text-green-500 text-xs font-medium">View →</td>
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
