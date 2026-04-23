"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";

interface Request { pId: string; dId: string; patientName: string; patientPhone: string; patientBloodGroup: string; doctorName: string; doctorDepartment: string; }
interface ScheduleForm { date: string; startTime: string; endTime: string; }
const emptyForm: ScheduleForm = { date: "", startTime: "", endTime: "" };

export default function RequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Request | null>(null);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/receptionist/requests").then(setRequests).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true); setError("");
    try {
      await api("/api/receptionist/requests/schedule", {
        method: "POST",
        body: JSON.stringify({ patientId: selected.pId, doctorId: selected.dId, ...form }),
      });
      setRequests(prev => prev.filter(r => !(r.pId === selected.pId && r.dId === selected.dId)));
      showToast("Appointment scheduled successfully", "success");
      setSelected(null);
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full p-12 text-[#94a3b8]">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Appointment Requests</h1>
        <p className="text-[#94a3b8] mt-1">{requests.length} pending</p>
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Patient", "Phone", "Blood Group", "Doctor", "Department", ""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No pending requests</td></tr>
              : requests.map((r, i) => (
                <tr key={i} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                  <td className="px-6 py-4 text-[#f1f5f9] font-medium">{r.patientName}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{r.patientPhone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs">{r.patientBloodGroup}</span>
                  </td>
                  <td className="px-6 py-4 text-[#f1f5f9]">{r.doctorName}</td>
                  <td className="px-6 py-4 text-[#94a3b8]">{r.doctorDepartment}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelected(r); setForm(emptyForm); setError(""); }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-all">
                      Schedule
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Schedule Appointment">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#0f1117] rounded-xl text-xs text-[#94a3b8] space-y-1">
              <p>Patient: <span className="text-[#f1f5f9]">{selected.patientName}</span></p>
              <p>Doctor: <span className="text-[#f1f5f9]">{selected.doctorName}</span> · {selected.doctorDepartment}</p>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">{error}</div>}
            {[{ key: "date", label: "Date", type: "date" }, { key: "startTime", label: "Start Time", type: "time" }, { key: "endTime", label: "End Time", type: "time" }].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-[#94a3b8] mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof ScheduleForm]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                  className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              {submitting ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
