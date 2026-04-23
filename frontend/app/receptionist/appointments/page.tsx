"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";

interface Appointment { aId: string; patientName: string; doctorName: string; date: string; startTime: string; endTime: string; status: string; }

const statusStyle: Record<string, string> = {
  Scheduled: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  Completed: "bg-green-500/10 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function ReceptionistAppointmentsPage() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = (status: string, date: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (date) params.set("date", date);
    const q = params.toString();
    api(`/api/receptionist/appointments${q ? `?${q}` : ""}`).then(setAppointments).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments("", ""); }, []);

  const handleCancel = async () => {
    if (!confirmId) return;
    setCancelling(true);
    try {
      await api(`/api/receptionist/appointments/${confirmId}/cancel`, { method: "POST" });
      setAppointments(prev => prev.map(a => a.aId === confirmId ? { ...a, status: "Cancelled" } : a));
      showToast("Appointment cancelled", "success");
      setConfirmId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to cancel", "error");
    } finally { setCancelling(false); }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">All Appointments</h1>
        <p className="text-[#94a3b8] mt-1">{appointments.length} total</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchAppointments(e.target.value, dateFilter); }}
          className="px-4 py-2.5 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); fetchAppointments(statusFilter, e.target.value); }}
          className="px-4 py-2.5 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl text-[#f1f5f9] text-sm focus:outline-none focus:border-indigo-500" />
        {(statusFilter || dateFilter) && (
          <button onClick={() => { setStatusFilter(""); setDateFilter(""); fetchAppointments("", ""); }}
            className="px-4 py-2.5 bg-[#2a2d3a] text-[#94a3b8] hover:text-[#f1f5f9] rounded-xl text-sm transition-all">
            Clear
          </button>
        )}
      </div>
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2d3a]">
              {["Patient", "Doctor", "Date", "Time", "Status", ""].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[#94a3b8] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">Loading...</td></tr>
              : appointments.length === 0
                ? <tr><td colSpan={6} className="px-6 py-8 text-center text-[#94a3b8]">No appointments found</td></tr>
                : appointments.map(a => (
                  <tr key={a.aId} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#0f1117]/50 transition-colors">
                    <td className="px-6 py-4 text-[#f1f5f9] font-medium">{a.patientName}</td>
                    <td className="px-6 py-4 text-[#94a3b8]">{a.doctorName}</td>
                    <td className="px-6 py-4 text-[#94a3b8]">{a.date}</td>
                    <td className="px-6 py-4 text-[#94a3b8]">{a.startTime} – {a.endTime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${statusStyle[a.status] ?? "bg-[#2a2d3a] text-[#94a3b8]"}`}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "Scheduled" && (
                        <button onClick={() => setConfirmId(a.aId)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-all">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-[#94a3b8] text-sm">Are you sure you want to cancel this appointment?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmId(null)}
              className="flex-1 py-2.5 bg-[#2a2d3a] text-[#94a3b8] hover:text-[#f1f5f9] text-sm font-medium rounded-xl transition-all">
              Keep
            </button>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
