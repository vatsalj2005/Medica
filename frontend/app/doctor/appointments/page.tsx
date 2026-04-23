"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";

interface Appointment { aId: string; pId: string; date: string; startTime: string; endTime: string; status: string; patientName: string; patientAge: number; }
interface CompleteForm { symptoms: string; diagnosis: string; prescription: string; healthCondition: string; treatment: string; type: string; }

const statusStyle: Record<string, string> = {
  Scheduled: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  Completed: "bg-green-500/10 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};
const emptyForm: CompleteForm = { symptoms: "", diagnosis: "", prescription: "", healthCondition: "", treatment: "", type: "Acute" };

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
              {["Patient", "Age", "Date", "Time", "Status", ""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No appointments found</td></tr>
              : appointments.map(a => (
                <tr key={a.aId} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                  <td className="px-6 py-4 text-[#f1f5f9] font-medium">{a.patientName}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.patientAge}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.date}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{a.startTime} – {a.endTime}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border ${statusStyle[a.status] ?? "bg-[#2a2d3a] text-[#94a3b8]"}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {a.status === "Scheduled" && (
                      <button onClick={() => { setSelected(a); setForm(emptyForm); }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-all">
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
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Complete Appointment">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#0f1117] rounded-xl text-xs text-[#94a3b8]">
              Patient: <span className="text-[#f1f5f9]">{selected.patientName}</span> · {selected.date} {selected.startTime}
            </div>
            {(["symptoms", "diagnosis", "prescription"] as const).map(key => (
              <div key={key}>
                <label className="block text-xs text-[#94a3b8] mb-1 capitalize">{key}</label>
                <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={2} required
                  className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
            ))}
            {(["healthCondition", "treatment"] as const).map(key => (
              <div key={key}>
                <label className="block text-xs text-[#94a3b8] mb-1">{key === "healthCondition" ? "Health Condition" : "Treatment"}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required
                  className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500">
                <option>Acute</option><option>Chronic</option><option>Preventive</option>
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              {submitting ? "Saving..." : "Complete Appointment"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
