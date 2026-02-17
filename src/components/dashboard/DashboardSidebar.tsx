import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  CreditCard,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

const userLinks = [
  { to: '/dashboard/user', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/user/events', label: 'Events', icon: Calendar },
  { to: '/dashboard/user/business', label: 'Business', icon: Briefcase },
  { to: '/dashboard/user/subscription', label: 'Subscription', icon: CreditCard },
];

const adminLinks = [
  { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/admin/moderation', label: 'Event Moderation', icon: ShieldCheck },
  { to: '/dashboard/admin/users', label: 'User Management', icon: Users },
];

const DashboardSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <aside
      className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-full ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
<div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border bg-[#3E4041] m-2 rounded-lg shadow-md">
  {/* Optional Icon / Placeholder */}
  <div className="w-8 h-8 rounded-full bg-[#E3A03F] flex items-center justify-center">
    <span className="text-white font-bold">TB</span>
  </div>

  {/* Text Logo */}
  {!collapsed && (
    <h1 className="font-extrabold text-xl tracking-tight flex items-center gap-1">
      <span className="text-white">Tamil</span>
      <span className="text-[#E3C32F]">Bee</span>
    </h1>
  )}
</div>



      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-sidebar-primary' : ''}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden lg:flex border-t border-sidebar-border p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
