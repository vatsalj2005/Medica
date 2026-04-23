"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageWrapper from "@/components/ui/PageWrapper";

interface Doctor { dId: string; name: string; department: string; phone: string; }
type Status = "idle" | "requested" | "scheduled";

function DoctorCardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-9 rounded-xl" />
    </div>
  );
}

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
        docs.map(async d => {
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

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">Request Appointment</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">Choose a doctor to request an appointment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)
          : doctors.map(doc => {
              const status = statuses[doc.dId] ?? "idle";
              return (
                <div key={doc.dId} className="card p-6 flex flex-col gap-4 hover:border-[#254525] transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-lg shrink-0">
                      👨‍⚕️
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#e8f5e8] font-semibold text-sm truncate">{doc.name}</p>
                      <p className="text-[#6aaa6a] text-xs">{doc.department}</p>
                    </div>
                  </div>
                  <p className="text-[#3d6b3d] text-xs">📞 {doc.phone}</p>

                  {status === "idle" && (
                    <button
                      onClick={() => handleRequest(doc.dId)}
                      disabled={requesting === doc.dId}
                      className="btn-primary mt-auto w-full py-2 text-sm"
                    >
                      {requesting === doc.dId
                        ? <><span className="animate-spin inline-block">⟳</span> Sending…</>
                        : "Request Appointment"}
                    </button>
                  )}
                  {status === "requested" && (
                    <div className="mt-auto w-full py-2 text-center badge-requested rounded-xl text-sm font-medium">
                      ⏳ Request Sent
                    </div>
                  )}
                  {status === "scheduled" && (
                    <div className="mt-auto w-full py-2 text-center badge-completed rounded-xl text-sm font-medium">
                      ✓ Already Scheduled
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>
    </PageWrapper>
  );
}
