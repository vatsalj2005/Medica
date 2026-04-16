'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Patient { p_id: string; name: string; age: number; blood_group: string; gender: string; phone: string }

export default function MyPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'doctor') loadPatients(session.user.id);
  }, []);

  const loadPatients = async (doctorId: string) => {
    setLoading(true);
    const { data: historyData } = await supabase.from('medical_history').select('p_id').eq('d_id', doctorId);
    if (historyData) {
      const uniquePatientIds = [...new Set(historyData.map((r) => r.p_id))];
      const patientsData = await Promise.all(
        uniquePatientIds.map(async (pId) => {
          const { data: patient } = await supabase.from('patient').select('p_id, name, age, blood_group, gender, phone').eq('p_id', pId).single();
          return patient;
        })
      );
      setPatients(patientsData.filter((p) => p !== null) as Patient[]);
    }
    setLoading(false);
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Patients</h1>
        <p className="text-text-muted mt-2">View patients you have treated</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 bg-border rounded-full mx-auto" />
                <div className="h-4 bg-border rounded w-3/4 mx-auto" />
                <div className="h-3 bg-border rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div key={patient.p_id} onClick={() => router.push(`/doctor/patients/${patient.p_id}`)}
              className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover-lift cursor-pointer">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-bold text-lg">{getInitials(patient.name)}</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary text-center">{patient.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Age:</span>
                  <span className="text-text-primary">{patient.age} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Blood Group:</span>
                  <span className="inline-flex px-2 py-0.5 bg-error/10 text-error rounded text-xs border border-error/20">{patient.blood_group}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Gender:</span>
                  <span className="text-text-primary">{patient.gender}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Phone:</span>
                  <span className="text-text-primary">{patient.phone}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-center text-primary text-sm font-medium">
                View Medical History
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-text-muted">No patients found</p>
        </div>
      )}
    </div>
  );
}
