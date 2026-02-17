import React from 'react';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { mockEvents, mockUsers } from '@/data/mockData';

const AdminDashboard: React.FC = () => {
  const totalUsers = mockUsers.length;
  const totalEvents = mockEvents.length;
  const pendingApprovals = mockEvents.filter(e => e.status === 'pending').length;

  const stats = [
    { title: 'Total Users', value: totalUsers, icon: Users, change: '+2 this week', changeType: 'positive' as const },
    { title: 'Total Events', value: totalEvents, icon: Calendar, change: '+5 this month', changeType: 'positive' as const },
    { title: 'Pending Approvals', value: pendingApprovals, icon: Clock, change: 'Needs review', changeType: 'neutral' as const },
    { title: 'Growth Rate', value: '18%', icon: TrendingUp, change: '+3% from last month', changeType: 'positive' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
