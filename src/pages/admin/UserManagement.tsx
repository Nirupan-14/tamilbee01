import React, { useState, useMemo } from 'react';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types';
import {
  ShieldCheck, ShieldOff, Mail, Phone, Eye, X,
  MapPin, List, LayoutGrid, Search, Users,
} from 'lucide-react';

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ blocked: boolean }> = ({ blocked }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    blocked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
  }`}>
    {blocked ? 'Blocked' : 'Active'}
  </span>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ user: User; size?: 'sm' | 'lg' }> = ({ user, size = 'sm' }) => (
  <div className={`rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0 ${
    size === 'lg' ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-sm'
  }`}>
    {user.firstName[0]}{user.lastName[0]}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(
    mockUsers.filter(u => u.role === 'user')
  );
  const [view, setView]         = useState<'table' | 'card'>('table');
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [search, setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Blocked'>('All');

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter(u => {
      const matchFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Active'  && !u.blocked) ||
        (activeFilter === 'Blocked' &&  u.blocked);
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)  ||
        u.email.toLowerCase().includes(q)      ||
        u.phone.toLowerCase().includes(q)      ||
        u.city.toLowerCase().includes(q)       ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, search, activeFilter]);

  // ── Stat counts ──────────────────────────────────────────────────────────

  const counts = {
    total:   users.length,
    active:  users.filter(u => !u.blocked).length,
    blocked: users.filter(u =>  u.blocked).length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const toggleBlock = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button onClick={() => setView('table')}
            className={`p-2 transition-colors ${view === 'table' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setView('card')}
            className={`p-2 transition-colors ${view === 'card' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',   value: counts.total,   style: 'text-foreground' },
          { label: 'Active',  value: counts.active,  style: 'text-green-600' },
          { label: 'Blocked', value: counts.blocked, style: 'text-destructive' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.style}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, email, phone, city…"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2">
        {(['All', 'Active', 'Blocked'] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === f ? 'gradient-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term or filter</p>
        </div>
      )}

      {/* ── Table View ── */}
      {view === 'table' && filtered.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {user.city}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge blocked={user.blocked} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewUser(user)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBlock(user.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.blocked
                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                              : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          }`}
                        >
                          {user.blocked
                            ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</>
                            : <><ShieldOff className="w-3.5 h-3.5" /> Block</>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card View ── */}
      {view === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(user => (
            <div key={user.id} className="glass-card hover-lift p-5 flex flex-col">

              {/* Top */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                  <div className="mt-1">
                    <StatusBadge blocked={user.blocked} />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {user.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {user.city}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setViewUser(user)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  View
                </button>
                <button
                  onClick={() => toggleBlock(user.id)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    user.blocked
                      ? 'border-green-500/30 text-green-600 hover:bg-green-500/10'
                      : 'border-destructive/30 text-destructive hover:bg-destructive/10'
                  }`}
                >
                  {user.blocked
                    ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</>
                    : <><ShieldOff className="w-3.5 h-3.5" /> Block</>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewUser(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {viewUser.firstName} {viewUser.lastName}
              </h2>
              <button onClick={() => setViewUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar block */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/40">
              <Avatar user={viewUser} size="lg" />
              <div>
                <p className="font-semibold text-foreground">
                  {viewUser.firstName} {viewUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">ID: {viewUser.id}</p>
                <StatusBadge blocked={viewUser.blocked} />
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              {[
                { label: 'Email', icon: <Mail className="w-4 h-4" />, value: viewUser.email },
                { label: 'Phone', icon: <Phone className="w-4 h-4" />, value: viewUser.phone },
                { label: 'City',  icon: <MapPin className="w-4 h-4" />, value: viewUser.city },
              ].map(({ label, icon, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-muted-foreground">{icon}</span>
                  <div>
                    <span className="font-medium text-foreground">{label}: </span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                </div>
              ))}
            </dl>

            {/* Block/Unblock in modal */}
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => {
                  toggleBlock(viewUser.id);
                  setViewUser({ ...viewUser, blocked: !viewUser.blocked });
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewUser.blocked
                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                }`}
              >
                {viewUser.blocked
                  ? <><ShieldCheck className="w-4 h-4" /> Unblock User</>
                  : <><ShieldOff className="w-4 h-4" /> Block User</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;