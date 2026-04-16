'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AppointmentWithDoctor {
  a_id: string;
  date: string;
  start_time: string;
  end_time: string;
  doctor: { name: string; department: string };
}

interface RequestWithDoctor {
  d_id: string;
  doctor: { name: string; department: string };
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({ upcoming: 0, pending: 0, total: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RequestWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'patient') {
      setUserName(session.user.name);
      loadDashboardData(session.user.id);
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const loadDashboardData = async (patientId: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: upcomingData } = await supabase
      .from('scheduled_appointments')
      .select('a_id, date, start_time, end_time, d_id')
      .eq('p_id', patientId)
      .eq('status', 'Scheduled')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);

    if (upcomingData) {
      const appointmentsWithDoctors = await Promise.all(
        upcomingData.map(async (apt) => {
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', apt.d_id).single();
          return { ...apt, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setUpcomingAppointments(appointmentsWithDoctors);
    }

    const { data: requestsData } = await supabase.from('requested_appointment').select('d_id').eq('p_id', patientId);
    if (requestsData) {
      const requestsWithDoctors = await Promise.all(
        requestsData.map(async (req) => {
          const { data: doctor } = await supabase.from('doctor').select('name, department').eq('d_id', req.d_id).single();
          return { ...req, doctor: doctor || { name: 'Unknown', department: 'Unknown' } };
        })
      );
      setPendingRequests(requestsWithDoctors);
    }

    const { count: totalCount } = await supabase
      .from('scheduled_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('p_id', patientId)
      .eq('status', 'Completed');

    setStats({ upcoming: upcomingData?.length || 0, pending: requestsData?.length || 0, total: totalCount || 0 });
    setLoading(false);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-text-primary">{greeting}, {userName} 👋</h1>
        <p className="text-text-muted mt-2">Here's your health dashboard overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming Appointments', value: stats.upcoming, color: 'text-primary', bg: 'bg-primary/10', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Pending Requests', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Total Visits', value: stats.total, color: 'text-success', bg: 'bg-success/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
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

      {/* Upcoming Appointments */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Upcoming Appointments</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-border rounded-lg shimmer" />)}</div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.a_id} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-text-primary font-semibold">{apt.doctor.name}</h3>
                    <p className="text-sm text-text-muted mt-1">
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-xs mr-2">{apt.doctor.department}</span>
                      {formatDate(apt.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-medium">{apt.start_time} - {apt.end_time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted">No upcoming appointments</p>
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Pending Requests</h2>
        {loading ? (
          <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-10 w-32 bg-border rounded-lg shimmer" />)}</div>
        ) : pendingRequests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pendingRequests.map((req) => (
              <div key={req.d_id} className="inline-flex items-center space-x-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-full">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-warning">{req.doctor.name} - {req.doctor.department}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8"><p className="text-text-muted">No pending requests</p></div>
        )}
      </div>
    </div>
  );
}
