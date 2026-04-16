'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface MedicalHistoryRecord {
  date: string;
  health_condition: string;
  treatment: string;
  type: string;
  d_id: string;
  doctor: { name: string; department: string };
}

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'patient') loadMedicalHistory(session.user.id);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') { setFilteredRecords(records); return; }
    setFilteredRecords(records.filter((r) => r.health_condition.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, records]);

  const loadMedicalHistory = async (patientId: string) => {
    setLoading(true);
    const { data: historyData } = await supabase.from('medical_history').select('date, health_condition, treatment, type, d_id').eq('p_id', patientId).order('date', { ascending: false });
    if (historyData) {
      const historyWithDoctors = await Promise.all(
        historyData.map(async (record) => {
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', record.d_id).single();
          return { ...record, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setRecords(historyWithDoctors);
      setFilteredRecords(historyWithDoctors);
    }
    setLoading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getTypeClass = (type: string) => {
    if (type === 'Acute') return 'bg-warning/10 text-warning border-warning/20';
    if (type === 'Chronic') return 'bg-error/10 text-error border-error/20';
    return 'bg-success/10 text-success border-success/20';
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Medical History</h1>
        <p className="text-text-muted mt-2">View your complete medical history and treatments</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by health condition..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary placeholder-text-muted" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  {['Date','Doctor','Department','Health Condition','Treatment','Type'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{record.doctor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{record.doctor.department}</td>
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
            <p className="text-text-muted">{searchTerm ? 'No records found matching your search' : 'No medical history available'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
