'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface AppointmentWithDetails {
  a_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient: { name: string };
  doctor: { name: string };
}

export default function ScheduledAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const { showToast } = useToast();

  useEffect(() => { loadAppointments(); }, []);
  useEffect(() => { applyFilters(); }, [statusFilter, dateFilter, appointments]);

  const loadAppointments = async () => {
    setLoading(true);
    const { data: appointmentsData } = await supabase
      .from('scheduled_appointments').select('a_id, p_id, d_id, date, start_time, end_time, status')
      .order('date', { ascending: false }).order('start_time', { ascending: false });

    if (appointmentsData) {
      const appointmentsWithDetails = await Promise.all(
        appointmentsData.map(async (apt) => {
          const { data: patient } = await supabase.from('patient').select('name').eq('p_id', apt.p_id).single();
          const { data: doctor } = await supabase.from('doctor').select('name').eq('d_id', apt.d_id).single();
          return { ...apt, patient: patient || { name: 'Unknown' }, doctor: doctor || { name: 'Unknown' } };
        })
      );
      setAppointments(appointmentsWithDetails);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    if (statusFilter !== 'All') filtered = filtered.filter((apt) => apt.status === statusFilter);
    if (dateFilter) filtered = filtered.filter((apt) => apt.date === dateFilter);
    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    const { error } = await supabase.from('scheduled_appointments').update({ status: 'Cancelled' }).eq('a_id', selectedAppointment.a_id);
    if (error) { showToast('Failed to cancel appointment', 'error'); return; }
    setAppointments((prev) => prev.map((apt) => apt.a_id === selectedAppointment.a_id ? { ...apt, status: 'Cancelled' } : apt));
    showToast('Appointment cancelled successfully', 'success');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusClass = (status: string) => {
    if (status === 'Scheduled') return 'bg-primary/10 text-primary border-primary/20';
    if (status === 'Completed') return 'bg-success/10 text-success border-success/20';
    return 'bg-error/10 text-error border-error/20';
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">All Appointments</h1>
        <p className="text-text-muted mt-2">View and manage all scheduled appointments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary">
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-muted mb-2">Date</label>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary" />
        </div>
        {(statusFilter !== 'All' || dateFilter) && (
          <div className="flex items-end">
            <button onClick={() => { setStatusFilter('All'); setDateFilter(''); }} className="px-4 py-3 text-text-muted hover:text-text-primary font-medium transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['ID','Patient','Doctor','Date','Time','Status','Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.a_id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-muted">{apt.a_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{apt.patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{apt.doctor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{apt.start_time} - {apt.end_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.status === 'Scheduled' && (
                        <button onClick={() => { setSelectedAppointment(apt); setShowConfirmDialog(true); }} className="text-sm text-error hover:text-error/80 font-medium transition-colors">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted">{statusFilter !== 'All' || dateFilter ? 'No appointments match your filters' : 'No appointments found'}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for ${selectedAppointment?.patient.name} with ${selectedAppointment?.doctor.name}?`}
      />
    </div>
  );
}
