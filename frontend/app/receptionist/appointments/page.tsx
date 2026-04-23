"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageWrapper from "@/components/ui/PageWrapper";

interface Appointment {
  aId: string; patientName: string; doctorName: string;
  date: string; startTime: string; endTime: string; status: string;
}

const statusBadge: Record<string, string> = {
  Scheduled: "badge-scheduled",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
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
    api(`/api/receptionist/appointments${q ? `?${q}` : ""}`)
      .then(setAppointments)
      .finally(() => setLoading(false));
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
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-[#e8f5e8]">All Appointments</h1>
        <p className="text-[#6aaa6a] mt-1 text-sm">
          {loading ? "Loading…" : `${appointments.length} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); fetchAppointments(e.target.value, dateFilter); }}
          className="input w-auto py-2.5 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <input
          type="date" value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); fetchAppointments(statusFilter, e.target.value); }}
          className="input w-auto py-2.5 text-sm"
        />

        {(statusFilter || dateFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setDateFilter(""); fetchAppointments("", ""); }}
            className="btn-ghost px-4 py-2.5 text-sm"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {loading ? <SkeletonTable rows={5} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e321e]">
                {["Patient", "Doctor", "Date", "Time", "Status", ""].map(h => (
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
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.doctorName}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.date}</td>
                    <td className="px-6 py-4 text-[#6aaa6a]">{a.startTime} – {a.endTime}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge[a.status] ?? "badge-scheduled"}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "Scheduled" && (
                        <button
                          onClick={() => setConfirmId(a.aId)}
                          className="btn-danger px-3 py-1.5 text-xs"
                        >
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
      )}

      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Cancel Appointment">
        <div className="space-y-5">
          <p className="text-[#6aaa6a] text-sm">Are you sure you want to cancel this appointment? This cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmId(null)}
              className="btn-ghost flex-1 py-2.5 text-sm"
            >
              Keep
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn-danger flex-1 py-2.5 text-sm"
            >
              {cancelling
                ? <><span className="animate-spin inline-block">⟳</span> Cancelling…</>
                : "Yes, Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
