import React, { useState, useMemo } from 'react';
import { Eye, Trash2, X, Pencil, CheckCircle, XCircle, List, LayoutGrid, Search, CalendarDays } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { SubscribedUser, mockSubscribedUsers } from '@/data/mockData';

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active:   'bg-green-500/10 text-green-600',
    inactive: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

const PlanBadge: React.FC<{ plan: string }> = ({ plan }) => {
  const map: Record<string, string> = {
    basic:      'bg-blue-500/10 text-blue-500',
    pro:        'bg-purple-500/10 text-purple-500',
    enterprise: 'bg-orange-500/10 text-orange-500',
    free:       'bg-muted text-muted-foreground',
  };
  const key = plan.toLowerCase();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[key] ?? 'bg-muted text-muted-foreground'}`}>
      {plan}
    </span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const isExpiringSoon = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminSubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscribedUser[]>(mockSubscribedUsers);
  const [view, setView]         = useState<'table' | 'card'>('table');
  const [viewItem, setViewItem] = useState<SubscribedUser | null>(null);
  const [editItem, setEditItem] = useState<SubscribedUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'active' | 'inactive'>('All');

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return subscriptions.filter(sub => {
      const matchFilter = activeFilter === 'All' || sub.status === activeFilter;
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        sub.id.toLowerCase().includes(q)       ||
        sub.userId.toLowerCase().includes(q)   ||
        sub.planId.toLowerCase().includes(q)   ||
        sub.startDate.includes(q)              ||
        sub.endDate.includes(q)                ||
        sub.status.toLowerCase().includes(q)
      );
    });
  }, [subscriptions, search, activeFilter]);

  // ── Stat counts ──────────────────────────────────────────────────────────

  const counts = {
    total:    subscriptions.length,
    active:   subscriptions.filter(s => s.status === 'active').length,
    inactive: subscriptions.filter(s => s.status === 'inactive').length,
    expiring: subscriptions.filter(s => s.status === 'active' && isExpiringSoon(s.endDate)).length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const updateStatus = (id: string, status: 'active' | 'inactive') =>
    setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, status } : sub));

  const handleDelete = () => {
    if (deleteId) setSubscriptions(prev => prev.filter(sub => sub.id !== deleteId));
    setDeleteId(null);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setSubscriptions(prev => prev.map(sub => sub.id === editItem.id ? editItem : sub));
    setEditItem(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: counts.total,    style: 'text-foreground' },
          { label: 'Active',     value: counts.active,   style: 'text-green-600' },
          { label: 'Inactive',   value: counts.inactive, style: 'text-destructive' },
          { label: 'Expiring Soon', value: counts.expiring, style: 'text-yellow-600' },
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
          placeholder="Search by ID, user, plan, date, status…"
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
      <div className="flex items-center gap-2 flex-wrap">
        {(['All', 'active', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeFilter === f ? 'gradient-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No subscriptions found</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{sub.userId}</div>
                      <div className="text-xs text-muted-foreground font-mono">#{sub.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={sub.planId} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm">
                      <span className={isExpiringSoon(sub.endDate) && sub.status === 'active' ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                        {formatDate(sub.endDate)}
                        {isExpiringSoon(sub.endDate) && sub.status === 'active' && (
                          <span className="ml-1.5 text-xs">(Soon)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(sub)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {sub.status !== 'active' && (
                          <button onClick={() => updateStatus(sub.id, 'active')} title="Activate"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status !== 'inactive' && (
                          <button onClick={() => updateStatus(sub.id, 'inactive')} title="Deactivate"
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setEditItem(sub)} title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(sub.id)} title="Delete"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
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
          {filtered.map(sub => (
            <div key={sub.id} className="glass-card hover-lift p-5 flex flex-col">

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-primary-foreground" />
                </div>
                <StatusBadge status={sub.status} />
              </div>

              {/* Plan */}
              <div className="mb-1">
                <PlanBadge plan={sub.planId} />
              </div>

              {/* User & ID */}
              <p className="text-sm font-medium text-foreground mt-2">{sub.userId}</p>
              <p className="text-xs text-muted-foreground font-mono mb-3">#{sub.id}</p>

              {/* Dates */}
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <div className="flex justify-between">
                  <span>Start</span>
                  <span className="text-foreground font-medium">{formatDate(sub.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>End</span>
                  <span className={`font-medium ${isExpiringSoon(sub.endDate) && sub.status === 'active' ? 'text-yellow-600' : 'text-foreground'}`}>
                    {formatDate(sub.endDate)}
                    {isExpiringSoon(sub.endDate) && sub.status === 'active' && ' ⚠️'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <button onClick={() => setViewItem(sub)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  View
                </button>
                <button onClick={() => setEditItem(sub)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Edit
                </button>
                {sub.status !== 'active' && (
                  <button onClick={() => updateStatus(sub.id, 'active')} title="Activate"
                    className="py-1.5 px-3 rounded-lg border border-border text-green-600 hover:bg-green-500/10 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {sub.status !== 'inactive' && (
                  <button onClick={() => updateStatus(sub.id, 'inactive')} title="Deactivate"
                    className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setDeleteId(sub.id)}
                  className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Subscription Details</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan hero */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Plan</p>
                <PlanBadge plan={viewItem.planId} />
              </div>
              <StatusBadge status={viewItem.status} />
            </div>

            <dl className="space-y-3 text-sm">
              {[
                { label: 'Subscription ID', value: `#${viewItem.id}` },
                { label: 'User ID',         value: viewItem.userId },
                { label: 'Start Date',      value: formatDate(viewItem.startDate) },
                { label: 'End Date',        value: formatDate(viewItem.endDate) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="font-semibold text-foreground w-36 shrink-0">{label}:</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Quick status actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              {viewItem.status !== 'active' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'active'); setViewItem({ ...viewItem, status: 'active' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Activate
                </button>
              )}
              {viewItem.status !== 'inactive' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'inactive'); setViewItem({ ...viewItem, status: 'inactive' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                  <XCircle className="w-4 h-4" /> Deactivate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Subscription</h2>
              <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">User ID</label>
                <input
                  type="text"
                  value={editItem.userId}
                  onChange={e => setEditItem({ ...editItem, userId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="User ID"
                />
              </div>

              {/* Plan ID */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
                <input
                  type="text"
                  value={editItem.planId}
                  onChange={e => setEditItem({ ...editItem, planId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Plan ID"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={editItem.startDate}
                    onChange={e => setEditItem({ ...editItem, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={editItem.endDate}
                    onChange={e => setEditItem({ ...editItem, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Status pill toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <div className="flex gap-3">
                  {(['active', 'inactive'] as const).map(s => (
                    <button key={s} type="button"
                      onClick={() => setEditItem({ ...editItem, status: s })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        editItem.status === s
                          ? s === 'active'
                            ? 'bg-green-500/10 border-green-500/40 text-green-600'
                            : 'bg-destructive/10 border-destructive/40 text-destructive'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleEditSave}
                  className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminSubscriptionManagement;