'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AppointmentWithDoctor {
  a_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  doctor: { name: string; department: string };
}

interface AppointmentSummary { symptoms: string; diagnosis: string; prescription: string }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<AppointmentSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'patient') loadAppointments(session.user.id);
  }, []);

  const loadAppointments = async (patientId: string) => {
    setLoading(true);
    const { data: appointmentsData } = await supabase
      .from('scheduled_appointments').select('a_id, date, start_time, end_time, status, d_id')
      .eq('p_id', patientId).order('date', { ascending: false }).order('start_time', { ascending: false });

    if (appointmentsData) {
      const appointmentsWithDoctors = await Promise.all(
        appointmentsData.map(async (apt) => {
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', apt.d_id).single();
          return { ...apt, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setAppointments(appointmentsWithDoctors);
    }
    setLoading(false);
  };

  const loadSummary = async (appointmentId: string) => {
    setLoadingSummary(true);
    setShowModal(true);
    const { data, error } = await supabase.from('appointment_summary').select('symptoms, diagnosis, prescription').eq('a_id', appointmentId).single();
    setSelectedSummary(data && !error ? data : { symptoms: 'No summary available', diagnosis: 'No diagnosis recorded', prescription: 'No prescription provided' });
    setLoadingSummary(false);
  };

  const closeModal = () => { setShowModal(false); setSelectedSummary(null); };
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
        <p className="text-text-muted mt-2">View all your scheduled and past appointments</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['Doctor','Department','Date','Time','Status','Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.a_id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{apt.doctor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{apt.doctor.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{apt.start_time} - {apt.end_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.status === 'Completed' && (
                        <button onClick={() => loadSummary(apt.a_id)} className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
                          View Summary
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

      {/* Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-primary/10 animate-scale-in">
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-text-primary">Appointment Summary</h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary transition-all hover:rotate-90 hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {loadingSummary ? (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-border rounded-lg shimmer" />)}</div>
              ) : selectedSummary ? (
                <>
                  {[
                    { label: 'Symptoms', value: selectedSummary.symptoms },
                    { label: 'Diagnosis', value: selectedSummary.diagnosis },
                    { label: 'Prescription', value: selectedSummary.prescription },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</h3>
                      <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-text-primary whitespace-pre-wrap">{value}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
            <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4">
              <button onClick={closeModal} className="w-full py-2.5 gradient-primary text-white rounded-lg font-medium hover:shadow-glow-sm transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
