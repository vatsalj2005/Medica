"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface Doctor { dId: string; name: string; department: string; phone: string; }
type Status = "idle" | "requested" | "scheduled";

export default function RequestAppointmentPage() {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setPatientId(s.id);
    api("/api/patient/doctors").then(async (docs: Doctor[]) => {
      setDoctors(docs);
      const entries = await Promise.all(
        docs.map(async (d) => {
          try {
            const res = await api(`/api/patient/${s.id}/request-status/${d.dId}`);
            return [d.dId, res.status as Status] as const;
          } catch { return [d.dId, "idle" as Status] as const; }
        })
      );
      setStatuses(Object.fromEntries(entries));
    }).finally(() => setLoading(false));
  }, []);

  const handleRequest = async (doctorId: string) => {
    setRequesting(doctorId);
    try {
      await api(`/api/patient/${patientId}/request/${doctorId}`, { method: "POST" });
      setStatuses(prev => ({ ...prev, [doctorId]: "requested" }));
      showToast("Appointment request sent!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send request", "error");
    } finally { setRequesting(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Request Appointment</h1>
        <p className="text-[#94a3b8] mt-1">Choose a doctor to request an appointment</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map(doc => {
          const status = statuses[doc.dId] ?? "idle";
          return (
            <div key={doc.dId} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-lg">👨‍⚕️</div>
                <div>
                  <p className="text-[#f1f5f9] font-semibold text-sm">{doc.name}</p>
                  <p className="text-[#94a3b8] text-xs">{doc.department}</p>
                </div>
              </div>
              <p className="text-[#94a3b8] text-xs">📞 {doc.phone}</p>
              {status === "idle" && (
                <button onClick={() => handleRequest(doc.dId)} disabled={requesting === doc.dId}
                  className="mt-auto w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
                  {requesting === doc.dId ? "Sending..." : "Request Appointment"}
                </button>
              )}
              {status === "requested" && (
                <button disabled className="mt-auto w-full py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded-xl cursor-not-allowed">
                  Request Sent
                </button>
              )}
              {status === "scheduled" && (
                <button disabled className="mt-auto w-full py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium rounded-xl cursor-not-allowed">
                  Already Scheduled
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
