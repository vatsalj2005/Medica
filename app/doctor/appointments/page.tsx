'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';

interface AppointmentWithPatient {
  a_id: string;
  p_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient: { name: string; age: number };
}

interface CompletionFormData {
  symptoms: string;
  diagnosis: string;
  prescription: string;
  healthCondition: string;
  treatment: string;
  type: string;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(null);
  const [formData, setFormData] = useState<CompletionFormData>({ symptoms: '', diagnosis: '', prescription: '', healthCondition: '', treatment: '', type: 'Acute' });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'doctor') {
      setDoctorId(session.user.id);
      loadAppointments(session.user.id);
    }
  }, []);

  const loadAppointments = async (dId: string) => {
    setLoading(true);
    const { data: appointmentsData } = await supabase
      .from('scheduled_appointments').select('a_id, p_id, date, start_time, end_time, status')
      .eq('d_id', dId).order('date', { ascending: false }).order('start_time', { ascending: false });

    if (appointmentsData) {
      const appointmentsWithPatients = await Promise.all(
        appointmentsData.map(async (apt) => {
          const { data: patient } = await supabase.from('patient').select('name, age').eq('p_id', apt.p_id).single();
          return { ...apt, patient: patient || { name: 'Unknown', age: 0 } };
        })
      );
      setAppointments(appointmentsWithPatients);
    }
    setLoading(false);
  };

  const openCompleteModal = (appointment: AppointmentWithPatient) => {
    setSelectedAppointment(appointment);
    setFormData({ symptoms: '', diagnosis: '', prescription: '', healthCondition: '', treatment: '', type: 'Acute' });
    setFormErrors([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setFormErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.symptoms.trim() || formData.symptoms.trim().length < 10) errors.push('Symptoms must be at least 10 characters');
    if (!formData.diagnosis.trim() || formData.diagnosis.trim().length < 10) errors.push('Diagnosis must be at least 10 characters');
    if (!formData.prescription.trim() || formData.prescription.trim().length < 10) errors.push('Prescription must be at least 10 characters');
    if (!formData.healthCondition.trim()) errors.push('Health Condition is required');
    if (!formData.treatment.trim()) errors.push('Treatment is required');
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedAppointment) return;
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.from('scheduled_appointments').update({ status: 'Completed' }).eq('a_id', selectedAppointment.a_id);
      if (updateError) { showToast('Failed to update appointment status', 'error'); setSubmitting(false); return; }

      const { error: summaryError } = await supabase.from('appointment_summary').insert({ a_id: selectedAppointment.a_id, symptoms: formData.symptoms, diagnosis: formData.diagnosis, prescription: formData.prescription });
      if (summaryError) { showToast('Failed to save appointment summary', 'error'); setSubmitting(false); return; }

      const { error: historyError } = await supabase.from('medical_history').insert({ p_id: selectedAppointment.p_id, d_id: doctorId, date: selectedAppointment.date, health_condition: formData.healthCondition, treatment: formData.treatment, type: formData.type });
      if (historyError) { showToast('Failed to save medical history', 'error'); setSubmitting(false); return; }

      setAppointments((prev) => prev.map((apt) => apt.a_id === selectedAppointment.a_id ? { ...apt, status: 'Completed' } : apt));
      showToast('Appointment completed successfully', 'success');
      closeModal();
    } catch { showToast('An error occurred. Please try again.', 'error'); }
    finally { setSubmitting(false); }
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
        <h1 className="text-3xl font-bold text-text-primary">My Appointments</h1>
        <p className="text-text-muted mt-2">View and complete your appointments</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['Patient Name','Age','Date','Time','Status','Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.a_id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{apt.patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{apt.patient.age} years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{apt.start_time} - {apt.end_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.status === 'Scheduled' && (
                        <button onClick={() => openCompleteModal(apt)} className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:shadow-glow-sm transition-all">
                          Complete
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
            <p className="text-text-muted">No appointments found</p>
          </div>
        )}
      </div>

      {showModal && selectedAppointment && (
        <Modal isOpen={showModal} onClose={closeModal} title={`Complete Appointment — ${selectedAppointment.patient.name}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {formErrors.length > 0 && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                <ul className="text-error text-sm space-y-1">{formErrors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
              </div>
            )}
            {[
              { id: 'symptoms', label: 'Symptoms', placeholder: "Describe the patient's symptoms...", rows: 3, field: 'symptoms' as keyof CompletionFormData },
              { id: 'diagnosis', label: 'Diagnosis', placeholder: 'Enter your diagnosis...', rows: 3, field: 'diagnosis' as keyof CompletionFormData },
              { id: 'prescription', label: 'Prescription', placeholder: 'Enter prescription details...', rows: 3, field: 'prescription' as keyof CompletionFormData },
            ].map(({ id, label, placeholder, rows, field }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-2">{label} <span className="text-error">*</span></label>
                <textarea id={id} rows={rows} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary placeholder-text-muted"
                  placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label htmlFor="healthCondition" className="block text-sm font-medium text-text-primary mb-2">Health Condition <span className="text-error">*</span></label>
              <input id="healthCondition" type="text" value={formData.healthCondition} onChange={(e) => setFormData({ ...formData, healthCondition: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary placeholder-text-muted"
                placeholder="e.g., Hypertension, Diabetes..." />
            </div>
            <div>
              <label htmlFor="treatment" className="block text-sm font-medium text-text-primary mb-2">Treatment <span className="text-error">*</span></label>
              <input id="treatment" type="text" value={formData.treatment} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary placeholder-text-muted"
                placeholder="Enter treatment plan..." />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-text-primary mb-2">Type <span className="text-error">*</span></label>
              <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary">
                <option value="Acute">Acute</option>
                <option value="Chronic">Chronic</option>
                <option value="Preventive">Preventive</option>
              </select>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-text-muted hover:text-text-primary font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 gradient-primary text-white rounded-lg font-medium hover:shadow-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                {submitting ? (
                  <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Submitting...</>
                ) : 'Submit & Complete'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
