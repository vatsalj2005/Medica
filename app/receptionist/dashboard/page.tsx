'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface RecentRequest {
  p_id: string;
  d_id: string;
  patient: { name: string };
  doctor: { name: string; department: string };
}

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({ pending: 0, today: 0, weekCompleted: 0 });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const { count: pendingCount } = await supabase.from('requested_appointment').select('*', { count: 'exact', head: true });
    const { count: todayCount } = await supabase.from('scheduled_appointments').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Scheduled');
    const { count: weekCompletedCount } = await supabase.from('scheduled_appointments').select('*', { count: 'exact', head: true }).eq('status', 'Completed').gte('date', weekAgoStr);

    setStats({ pending: pendingCount || 0, today: todayCount || 0, weekCompleted: weekCompletedCount || 0 });

    const { data: requestsData } = await supabase.from('requested_appointment').select('p_id, d_id').limit(5);
    if (requestsData) {
      const requestsWithDetails = await Promise.all(
        requestsData.map(async (req) => {
          const { data: patient } = await supabase.from('patient').select('name').eq('p_id', req.p_id).single();
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', req.d_id).single();
          return { ...req, patient: patient || { name: 'Unknown' }, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setRecentRequests(requestsWithDetails);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-text-primary">Receptionist Dashboard</h1>
        <p className="text-text-muted mt-2">Manage appointments and patient requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Requests', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
          { label: "Today's Appointments", value: stats.today, color: 'text-primary', bg: 'bg-primary/10', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Completed This Week', value: stats.weekCompleted, color: 'text-success', bg: 'bg-success/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Recent Appointment Requests</h2>
          <Link href="/receptionist/requests" className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-border rounded-lg shimmer" />)}</div>
        ) : recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map((req, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {req.patient.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-text-primary font-semibold">{req.patient.name}</h3>
                      <p className="text-sm text-text-muted">Requesting {req.doctor.name} ({req.doctor.department})</p>
                    </div>
                  </div>
                  <Link href="/receptionist/requests" className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium transition-colors hover:shadow-glow-sm">
                    Schedule
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-text-muted">No pending requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
