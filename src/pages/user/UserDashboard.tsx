import React from 'react';
import { Calendar, Briefcase, TrendingUp, Users } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

const UserDashboard: React.FC = () => {
  const stats = [
    { title: 'Total Events', value: 12, icon: Calendar, change: '+3 this month', changeType: 'positive' as const },
    { title: 'Active Businesses', value: 4, icon: Briefcase, change: '+1 this month', changeType: 'positive' as const },
    { title: 'Total Views', value: '2.4K', icon: TrendingUp, change: '+12% from last month', changeType: 'positive' as const },
    { title: 'Followers', value: 89, icon: Users, change: '+5 this week', changeType: 'positive' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's an overview of your activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
