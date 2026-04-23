"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface Appointment {
  aId: string; date: string; startTime: string; endTime: string;
  status: string; doctorName: string; doctorDepartment: string;
}
interface Summary { symptoms: string; diagnosis: string; prescription: string; }

const statusBadge: Record<string, string> = {
  Scheduled: "badge-scheduled",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    api(`/api/patient/${s.id}/appointments`).then(setAppointments).finally(() => setLoading(false));
  }, []);

  const viewSummary = async (aId: string) => {
    setSummaryLoading(true); setModalOpen(true); setSummary(null);
    try { setSummary(await api(`/api/patient/appointments/${aId}/summary`)); }
    finally { setSummaryLoading(false); }
  };

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">My Appointments</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">{loading ? "Loading…" : `${appointments.length} total`}</p>
      </div>

      {loading ? <SkeletonTable rows={5} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e321e]">
                {["Doctor", "Department", "Date", "Time", "Status", ""].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0
                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-[#3d6b3d]">No appointments found</td></tr>
                : appointments.map(a => (
                  <tr key={a.aId} className="table-row">
                    <td className="px-6 py-4 text-[#e8f5e8] font-medium">{a.doctorName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.doctorDepartment}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.date}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.startTime} – {a.endTime}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge[a.status] ?? "badge-scheduled"}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "Completed" && (
                        <button
                          onClick={() => viewSummary(a.aId)}
                          className="btn-outline-green px-3 py-1.5 text-xs"
                        >
                          View Summary
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSummary(null); }} title="Appointment Summary">
        {summaryLoading
          ? <div className="space-y-3">
              {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          : summary
            ? <div className="space-y-4">
                {([["Symptoms", summary.symptoms], ["Diagnosis", summary.diagnosis], ["Prescription", summary.prescription]] as const).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-[#6aaa6a] mb-1.5 uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-[#e8f5e8] text-sm bg-[#080e08] border border-[#1e321e] rounded-xl p-3 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            : <p className="text-[#3d6b3d] text-sm">No summary available</p>
        }
      </Modal>
    </PageWrapper>
  );
}
