"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface Request {
  pId: string; dId: string; patientName: string; patientPhone: string;
  patientBloodGroup: string; doctorName: string; doctorDepartment: string;
}
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

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">Appointment Requests</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">
          {loading ? "Loading…" : `${requests.length} pending`}
        </p>
      </div>

      {loading ? <SkeletonTable rows={5} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e321e]">
                {["Patient", "Phone", "Blood Group", "Doctor", "Department", ""].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[#6aaa6a] font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0
                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-[#3d6b3d]">No pending requests</td></tr>
                : requests.map((r, i) => (
                  <tr key={i} className="table-row">
                    <td className="px-6 py-4 text-[#e8f5e8] font-medium">{r.patientName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{r.patientPhone}</td>
                    <td className="px-6 py-4"><span className="badge-blood">{r.patientBloodGroup}</span></td>
                    <td className="px-6 py-4 text-[#e8f5e8]">{r.doctorName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{r.doctorDepartment}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelected(r); setForm(emptyForm); setError(""); }}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Schedule Appointment">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#080e08] border border-[#1e321e] rounded-xl text-xs text-[#6aaa6a] space-y-1">
              <p>Patient: <span className="text-[#e8f5e8] font-medium">{selected.patientName}</span></p>
              <p>Doctor: <span className="text-[#e8f5e8] font-medium">{selected.doctorName}</span> · {selected.doctorDepartment}</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs animate-fade-in">
                {error}
              </div>
            )}

            {[
              { key: "date",      label: "Date",       type: "date" },
              { key: "startTime", label: "Start Time", type: "time" },
              { key: "endTime",   label: "End Time",   type: "time" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-[#6aaa6a] mb-1.5 font-medium">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof ScheduleForm]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required
                  className="input text-sm py-2"
                />
              </div>
            ))}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 text-sm">
              {submitting
                ? <><span className="animate-spin inline-block">⟳</span> Scheduling…</>
                : "Schedule Appointment"}
            </button>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
