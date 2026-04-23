"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal";

interface Appointment { aId: string; date: string; startTime: string; endTime: string; status: string; doctorName: string; doctorDepartment: string; }
interface Summary { symptoms: string; diagnosis: string; prescription: string; }

const statusStyle: Record<string, string> = {
  Scheduled: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  Completed: "bg-green-500/10 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
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
    setSummaryLoading(true); setModalOpen(true);
    try { setSummary(await api(`/api/patient/appointments/${aId}/summary`)); }
    finally { setSummaryLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">My Appointments</h1>
        <p className="text-[#94a3b8] mt-1">{appointments.length} total</p>
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Doctor", "Department", "Date", "Time", "Status", ""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No appointments found</td></tr>
              : appointments.map(a => (
                <tr key={a.aId} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                  <td className="px-6 py-4 text-[#f1f5f9] font-medium">{a.doctorName}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.doctorDepartment}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.date}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.startTime} – {a.endTime}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border ${statusStyle[a.status] ?? "bg-[#2a2d3a] text-[#94a3b8]"}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {a.status === "Completed" && (
                      <button onClick={() => viewSummary(a.aId)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-all">
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
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSummary(null); }} title="Appointment Summary">
        {summaryLoading ? <p className="text-[#94a3b8] text-sm">Loading...</p>
          : summary
            ? <div className="space-y-4">
                {[["Symptoms", summary.symptoms], ["Diagnosis", summary.diagnosis], ["Prescription", summary.prescription]].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-[#94a3b8] mb-1">{label}</p>
                    <p className="text-[#f1f5f9] text-sm bg-[#0f1117] rounded-xl p-3">{value}</p>
                  </div>
                ))}
              </div>
            : <p className="text-[#94a3b8] text-sm">No summary available</p>
        }
      </Modal>
    </div>
  );
}
