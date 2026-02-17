import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, changeType = 'neutral' }) => (
  <div className="glass-card hover-lift p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-2 ${
            changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-accent">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
