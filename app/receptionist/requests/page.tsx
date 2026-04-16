'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';

interface RequestWithDetails {
  p_id: string;
  d_id: string;
  patient: { name: string; phone: string; blood_group: string };
  doctor: { name: string; department: string };
}

interface ScheduleFormData { date: string; startTime: string; endTime: string }

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({ date: '', startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data: requestsData } = await supabase.from('requested_appointment').select('p_id, d_id');
    if (requestsData) {
      const requestsWithDetails = await Promise.all(
        requestsData.map(async (req) => {
          const { data: patient } = await supabase.from('patient').select('name, phone, blood_group').eq('p_id', req.p_id).single();
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', req.d_id).single();
          return { ...req, patient: patient || { name: 'Unknown', phone: '', blood_group: '' }, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setRequests(requestsWithDetails);
    }
    setLoading(false);
  };

  const openScheduleModal = (request: RequestWithDetails) => {
    setSelectedRequest(request);
    setFormData({ date: '', startTime: '', endTime: '' });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelectedRequest(null); setFormData({ date: '', startTime: '', endTime: '' }); setFormError(''); };

  const generateAppointmentId = async (): Promise<string> => {
    const { data } = await supabase.from('scheduled_appointments').select('a_id').order('a_id', { ascending: false }).limit(1);
    if (!data || data.length === 0) return 'A001';
    const num = parseInt(data[0].a_id.substring(1)) + 1;
    return `A${num.toString().padStart(3, '0')}`;
  };

  const checkTimeConflict = async (doctorId: string, date: string, startTime: string, endTime: string) => {
    const { data: existing } = await supabase.from('scheduled_appointments').select('start_time, end_time').eq('d_id', doctorId).eq('date', date).neq('status', 'Cancelled');
    if (!existing || existing.length === 0) return { hasConflict: false };
    for (const apt of existing) {
      if ((startTime >= apt.start_time && startTime < apt.end_time) || (endTime > apt.start_time && endTime <= apt.end_time) || (startTime <= apt.start_time && endTime >= apt.end_time)) {
        return { hasConflict: true, conflictDetails: `${selectedRequest?.doctor.name} has an appointment from ${apt.start_time} to ${apt.end_time} on this date.` };
      }
    }
    return { hasConflict: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedRequest) return;

    const selectedDate = new Date(formData.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setFormError('Cannot schedule appointments in the past'); return; }
    if (formData.endTime <= formData.startTime) { setFormError('End time must be after start time'); return; }

    setSubmitting(true);
    const conflictCheck = await checkTimeConflict(selectedRequest.d_id, formData.date, formData.startTime, formData.endTime);
    if (conflictCheck.hasConflict) { setFormError(conflictCheck.conflictDetails || 'Time slot conflict detected'); setSubmitting(false); return; }

    try {
      const appointmentId = await generateAppointmentId();
      const { error: insertError } = await supabase.from('scheduled_appointments').insert({ a_id: appointmentId, p_id: selectedRequest.p_id, d_id: selectedRequest.d_id, date: formData.date, start_time: formData.startTime, end_time: formData.endTime, status: 'Scheduled' });
      if (insertError) { setFormError('Failed to schedule appointment. Please try again.'); setSubmitting(false); return; }

      await supabase.from('requested_appointment').delete().eq('p_id', selectedRequest.p_id).eq('d_id', selectedRequest.d_id);
      setRequests((prev) => prev.filter((req) => !(req.p_id === selectedRequest.p_id && req.d_id === selectedRequest.d_id)));
      showToast(`Appointment scheduled for ${selectedRequest.patient.name} with ${selectedRequest.doctor.name}`, 'success');
      closeModal();
    } catch { setFormError('An error occurred. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Appointment Requests</h1>
        <p className="text-text-muted mt-2">Schedule appointments for pending requests</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['Patient Name','Phone','Blood Group','Doctor','Department','Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req, index) => (
                  <tr key={index} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{req.patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{req.patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">{req.patient.blood_group}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{req.doctor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{req.doctor.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => openScheduleModal(req)} className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:shadow-glow-sm transition-all">
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-text-muted">No pending requests</p>
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <Modal isOpen={showModal} onClose={closeModal} title={`Schedule — ${selectedRequest.patient.name} with ${selectedRequest.doctor.name}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{formError}</div>}
            {[
              { id: 'date', label: 'Date', type: 'date', value: formData.date, min: getTodayDate(), onChange: (v: string) => setFormData({ ...formData, date: v }) },
              { id: 'startTime', label: 'Start Time', type: 'time', value: formData.startTime, onChange: (v: string) => setFormData({ ...formData, startTime: v }) },
              { id: 'endTime', label: 'End Time', type: 'time', value: formData.endTime, onChange: (v: string) => setFormData({ ...formData, endTime: v }) },
            ].map(({ id, label, type, value, min, onChange }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-2">{label}</label>
                <input id={id} type={type} min={min} value={value} onChange={(e) => onChange(e.target.value)} required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary" />
              </div>
            ))}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-text-muted hover:text-text-primary font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 gradient-primary text-white rounded-lg font-medium hover:shadow-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                {submitting ? (
                  <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Scheduling...</>
                ) : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
