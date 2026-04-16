'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/context/ToastContext';

interface Doctor { d_id: string; name: string; department: string; phone: string }
type RequestStatus = { [key: string]: 'idle' | 'requested' | 'scheduled' | 'loading' }

export default function RequestAppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>({});
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'patient') {
      setPatientId(session.user.id);
      loadDoctors(session.user.id);
    }
  }, []);

  const loadDoctors = async (pId: string) => {
    setLoading(true);
    const { data: doctorsData } = await supabase.from('doctor').select('d_id, name, department, phone').order('name', { ascending: true });
    if (doctorsData) {
      setDoctors(doctorsData);
      const statusMap: RequestStatus = {};
      for (const doctor of doctorsData) {
        const { data: scheduledData } = await supabase.from('scheduled_appointments').select('a_id').eq('p_id', pId).eq('d_id', doctor.d_id).eq('status', 'Scheduled').single();
        if (scheduledData) { statusMap[doctor.d_id] = 'scheduled'; continue; }
        const { data: requestData } = await supabase.from('requested_appointment').select('p_id').eq('p_id', pId).eq('d_id', doctor.d_id).single();
        statusMap[doctor.d_id] = requestData ? 'requested' : 'idle';
      }
      setRequestStatus(statusMap);
    }
    setLoading(false);
  };

  const handleRequestAppointment = async (doctorId: string, doctorName: string) => {
    setRequestStatus((prev) => ({ ...prev, [doctorId]: 'loading' }));
    try {
      const { error } = await supabase.from('requested_appointment').insert({ p_id: patientId, d_id: doctorId });
      if (error) {
        if (error.code === '23505') { showToast('Request already sent to this doctor', 'info'); setRequestStatus((prev) => ({ ...prev, [doctorId]: 'requested' })); }
        else { showToast('Failed to send request. Please try again.', 'error'); setRequestStatus((prev) => ({ ...prev, [doctorId]: 'idle' })); }
      } else {
        showToast(`Appointment request sent to ${doctorName}`, 'success');
        setRequestStatus((prev) => ({ ...prev, [doctorId]: 'requested' }));
      }
    } catch { showToast('An error occurred. Please try again.', 'error'); setRequestStatus((prev) => ({ ...prev, [doctorId]: 'idle' })); }
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      Cardiology: 'bg-error/10 text-error border-error/20',
      Neurology: 'bg-secondary/10 text-secondary border-secondary/20',
      Orthopedics: 'bg-info/10 text-info border-info/20',
      Pediatrics: 'bg-primary-light/10 text-primary-light border-primary-light/20',
      Dermatology: 'bg-success/10 text-success border-success/20',
      Psychiatry: 'bg-primary/10 text-primary border-primary/20',
    };
    return colors[department] || 'bg-border/50 text-text-muted border-border';
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Find a Doctor</h1>
        <p className="text-text-muted mt-2">Browse available doctors and request appointments</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 bg-border rounded-full mx-auto" />
                <div className="h-4 bg-border rounded w-3/4 mx-auto" />
                <div className="h-3 bg-border rounded w-1/2 mx-auto" />
                <div className="h-10 bg-border rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const status = requestStatus[doctor.d_id] || 'idle';
            return (
              <div key={doctor.d_id} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-primary font-bold text-lg">{getInitials(doctor.name)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary text-center">{doctor.name}</h3>
                </div>
                <div className="flex justify-center mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDepartmentColor(doctor.department)}`}>{doctor.department}</span>
                </div>
                <div className="flex items-center justify-center text-sm text-text-muted mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {doctor.phone}
                </div>
                {status === 'scheduled' ? (
                  <button disabled className="w-full py-2.5 bg-success/10 text-success border border-success/20 rounded-lg font-medium cursor-not-allowed">Already Scheduled</button>
                ) : status === 'requested' ? (
                  <button disabled className="w-full py-2.5 bg-warning/10 text-warning border border-warning/20 rounded-lg font-medium cursor-not-allowed">Request Sent</button>
                ) : status === 'loading' ? (
                  <button disabled className="w-full py-2.5 gradient-primary text-white rounded-lg font-medium cursor-not-allowed flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  </button>
                ) : (
                  <button onClick={() => handleRequestAppointment(doctor.d_id, doctor.name)} className="w-full py-2.5 gradient-primary text-white rounded-lg font-medium hover:shadow-glow-sm transition-all ripple">
                    Request Appointment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-text-muted">No doctors available</p>
        </div>
      )}
    </div>
  );
}
