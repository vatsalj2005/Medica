"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface Appointment {
  aId: string; pId: string; date: string; startTime: string; endTime: string;
  status: string; patientName: string; patientAge: number;
}
interface CompleteForm {
  symptoms: string; diagnosis: string; prescription: string;
  healthCondition: string; treatment: string; type: string;
}

const statusBadge: Record<string, string> = {
  Scheduled: "badge-scheduled",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};
const emptyForm: CompleteForm = {
  symptoms: "", diagnosis: "", prescription: "",
  healthCondition: "", treatment: "", type: "Acute",
};

export default function DoctorAppointmentsPage() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [form, setForm] = useState<CompleteForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setDoctorId(s.id);
    api(`/api/doctor/${s.id}/appointments`).then(setAppointments).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await api(`/api/doctor/${doctorId}/appointments/${selected.aId}/complete`, {
        method: "POST",
        body: JSON.stringify({ patientId: selected.pId, date: selected.date, ...form }),
      });
      setAppointments(prev => prev.map(a => a.aId === selected.aId ? { ...a, status: "Completed" } : a));
      showToast("Appointment completed successfully", "success");
      setSelected(null);
    } catch (err: any) {
      showToast(err.message || "Failed to complete appointment", "error");
    } finally { setSubmitting(false); }
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
                {["Patient", "Age", "Date", "Time", "Status", ""].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0
                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-[#3d6b3d]">No appointments found</td></tr>
                : appointments.map(a => (
                  <tr key={a.aId} className="table-row">
                    <td className="px-6 py-4 text-[#e8f5e8] font-medium">{a.patientName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.patientAge}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.date}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.startTime} – {a.endTime}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge[a.status] ?? "badge-scheduled"}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "Scheduled" && (
                        <button
                          onClick={() => { setSelected(a); setForm(emptyForm); }}
                          className="btn bg-green-700/80 hover:bg-green-600 text-white px-3 py-1.5 text-xs shadow-sm shadow-green-900/30 active:scale-95"
                        >
                          Complete
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Complete Appointment">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#080e08] border border-[#1e321e] rounded-xl text-xs text-[#6aaa6a]">
              Patient: <span className="text-[#e8f5e8] font-medium">{selected.patientName}</span>
              <span className="mx-2">·</span>
              {selected.date} {selected.startTime}
            </div>

            {(["symptoms", "diagnosis", "prescription"] as const).map(key => (
              <div key={key}>
                <label className="block text-xs text-[#6aaa6a] mb-1.5 capitalize font-medium">{key}</label>
                <textarea
                  value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  rows={2} required
                  className="input resize-none text-sm py-2"
                />
              </div>
            ))}

            {(["healthCondition", "treatment"] as const).map(key => (
              <div key={key}>
                <label className="block text-xs text-[#6aaa6a] mb-1.5 font-medium">
                  {key === "healthCondition" ? "Health Condition" : "Treatment"}
                </label>
                <input
                  value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required className="input text-sm py-2"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs text-[#6aaa6a] mb-1.5 font-medium">Condition Type</label>
              <select
                value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="input text-sm py-2"
              >
                <option>Acute</option>
                <option>Chronic</option>
                <option>Preventive</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 text-sm">
              {submitting
                ? <><span className="animate-spin inline-block">⟳</span> Saving…</>
                : "Complete Appointment"}
            </button>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
