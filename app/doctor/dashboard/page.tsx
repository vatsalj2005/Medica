'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface TodayAppointment {
  a_id: string;
  start_time: string;
  end_time: string;
  patient: { name: string; age: number; blood_group: string };
}

export default function DoctorDashboard() {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({ today: 0, completed: 0, uniquePatients: 0 });
  const [todaySchedule, setTodaySchedule] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'doctor') {
      setUserName(session.user.name);
      loadDashboardData(session.user.id);
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const loadDashboardData = async (doctorId: string) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { count: todayCount } = await supabase
      .from('scheduled_appointments').select('*', { count: 'exact', head: true })
      .eq('d_id', doctorId).eq('date', today).eq('status', 'Scheduled');

    const { count: completedCount } = await supabase
      .from('scheduled_appointments').select('*', { count: 'exact', head: true })
      .eq('d_id', doctorId).eq('status', 'Completed');

    const { data: historyData } = await supabase.from('medical_history').select('p_id').eq('d_id', doctorId);
    const uniquePatients = historyData ? new Set(historyData.map((r) => r.p_id)).size : 0;

    setStats({ today: todayCount || 0, completed: completedCount || 0, uniquePatients });

    const { data: scheduleData } = await supabase
      .from('scheduled_appointments').select('a_id, p_id, start_time, end_time')
      .eq('d_id', doctorId).eq('date', today).eq('status', 'Scheduled')
      .order('start_time', { ascending: true });

    if (scheduleData) {
      const scheduleWithPatients = await Promise.all(
        scheduleData.map(async (apt) => {
          const { data: patient } = await supabase.from('patient').select('name, age, blood_group').eq('p_id', apt.p_id).single();
          return { ...apt, patient: patient || { name: 'Unknown', age: 0, blood_group: 'Unknown' } };
        })
      );
      setTodaySchedule(scheduleWithPatients);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-text-primary">{greeting}, {userName} 👋</h1>
        <p className="text-text-muted mt-2">Here's your schedule for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Today's Scheduled", value: stats.today, color: 'text-primary', bg: 'bg-primary/10', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Total Completed', value: stats.completed, color: 'text-success', bg: 'bg-success/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Unique Patients', value: stats.uniquePatients, color: 'text-secondary', bg: 'bg-secondary/10', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
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

      {/* Today's Schedule */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6">Today's Schedule</h2>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-border rounded-lg shimmer" />)}</div>
        ) : todaySchedule.length > 0 ? (
          <div className="space-y-4">
            {todaySchedule.map((apt) => (
              <div key={apt.a_id} className="flex items-center bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex-shrink-0 w-32">
                  <div className="text-text-primary font-semibold">{apt.start_time}</div>
                  <div className="text-sm text-text-muted">{apt.end_time}</div>
                </div>
                <div className="w-px h-12 bg-border mx-4" />
                <div className="flex-1 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {apt.patient.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-text-primary font-semibold">{apt.patient.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-text-muted">{apt.patient.age} years</span>
                      <span className="inline-flex px-2 py-0.5 bg-error/10 text-error rounded text-xs border border-error/20">
                        {apt.patient.blood_group}
                      </span>
                    </div>
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
            <p className="text-text-muted">No appointments scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
