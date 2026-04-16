'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface Patient { p_id: string; name: string; age: number; blood_group: string; gender: string; phone: string; email: string }
interface MedicalRecord { date: string; health_condition: string; treatment: string; type: string }

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.P_ID as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'doctor') loadPatientData(session.user.id, patientId);
  }, [patientId]);

  const loadPatientData = async (dId: string, pId: string) => {
    setLoading(true);
    const { data: historyCheck } = await supabase.from('medical_history').select('p_id').eq('d_id', dId).eq('p_id', pId).limit(1);
    if (!historyCheck || historyCheck.length === 0) { router.push('/doctor/patients'); return; }

    const { data: patientData } = await supabase.from('patient').select('p_id, name, age, blood_group, gender, phone, email').eq('p_id', pId).single();
    if (patientData) setPatient(patientData);

    const { data: historyData } = await supabase.from('medical_history').select('date, health_condition, treatment, type').eq('d_id', dId).eq('p_id', pId).order('date', { ascending: false });
    if (historyData) setMedicalHistory(historyData);

    setLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getTypeClass = (type: string) => {
    if (type === 'Acute') return 'bg-warning/10 text-warning border-warning/20';
    if (type === 'Chronic') return 'bg-error/10 text-error border-error/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse space-y-8">
        <div className="h-48 bg-surface rounded-xl" />
        <div className="h-96 bg-surface rounded-xl" />
      </div>
    );
  }

  if (!patient) {
    return <div className="max-w-7xl mx-auto text-center py-12"><p className="text-text-muted">Patient not found</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Back Button */}
      <button onClick={() => router.push('/doctor/patients')} className="flex items-center text-text-muted hover:text-text-primary transition-colors">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Patients
      </button>

      {/* Patient Info */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-2xl">{getInitials(patient.name)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary mb-4">{patient.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-text-muted">Age</p>
                <p className="text-text-primary font-medium">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Blood Group</p>
                <span className="inline-flex px-2.5 py-1 bg-error/10 text-error rounded text-sm border border-error/20 font-medium">{patient.blood_group}</span>
              </div>
              <div>
                <p className="text-sm text-text-muted">Gender</p>
                <p className="text-text-primary font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Phone</p>
                <p className="text-text-primary font-medium">{patient.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-text-muted">Email</p>
                <p className="text-text-primary font-medium">{patient.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Medical History</h2>
          <p className="text-sm text-text-muted mt-1">Records from your consultations</p>
        </div>
        {medicalHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['Date','Health Condition','Treatment','Type'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicalHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm text-text-primary max-w-xs">{record.health_condition}</td>
                    <td className="px-6 py-4 text-sm text-text-muted max-w-xs">{record.treatment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeClass(record.type)}`}>{record.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-muted">No medical history available</p>
          </div>
        )}
      </div>
    </div>
  );
}
