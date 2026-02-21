import React, { useState, useMemo } from 'react';
import { mockPayments, mockUsers } from '@/data/mockData';
import { Payment } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Eye, X, Pencil, CheckCircle, XCircle, Trash2,
  List, LayoutGrid, Search, DollarSign,
} from 'lucide-react';

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    paid:    'bg-green-500/10 text-green-600',
    pending: 'bg-yellow-500/10 text-yellow-600',
    failed:  'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserName = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
};

const getUserEmail = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  return user?.email ?? '';
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [view, setView]         = useState<'table' | 'card'>('table');
  const [viewItem, setViewItem] = useState<Payment | null>(null);
  const [editItem, setEditItem] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'paid' | 'pending' | 'failed'>('All');

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return payments.filter(p => {
      const matchFilter = activeFilter === 'All' || p.status === activeFilter;
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        getUserName(p.userId).toLowerCase().includes(q) ||
        getUserEmail(p.userId).toLowerCase().includes(q) ||
        String(p.amount).includes(q) ||
        p.date.includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    });
  }, [payments, search, activeFilter]);

  // ── Stat counts ──────────────────────────────────────────────────────────

  const counts = {
    total:   payments.length,
    paid:    payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const updateStatus = (id: string, status: Payment['status']) =>
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));

  const handleDelete = () => {
    if (deleteId) setPayments(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setPayments(prev => prev.map(p => p.id === editItem.id ? editItem : p));
    setEditItem(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
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
          { label: 'Paid',    value: counts.paid,    style: 'text-green-600' },
          { label: 'Pending', value: counts.pending, style: 'text-yellow-600' },
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
          placeholder="Search by ID, user, amount, date, status…"
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
        {(['All', 'paid', 'pending', 'failed'] as const).map(f => (
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
          <p className="text-sm font-medium text-foreground">No payments found</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{getUserName(p.userId)}</div>
                      <div className="text-xs text-muted-foreground">{getUserEmail(p.userId)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-foreground">${p.amount.toLocaleString()}</div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(p.date)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-muted-foreground font-mono">
                      #{p.id}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(p)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {p.status !== 'paid' && (
                          <button onClick={() => updateStatus(p.id, 'paid')} title="Mark as Paid"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status !== 'pending' && (
                          <button onClick={() => updateStatus(p.id, 'pending')} title="Mark as Pending"
                            className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-500/10 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setEditItem(p)} title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} title="Delete"
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
          {filtered.map(p => (
            <div key={p.id} className="glass-card hover-lift p-5 flex flex-col">

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-primary-foreground" />
                </div>
                <StatusBadge status={p.status} />
              </div>

              {/* Amount */}
              <p className="text-2xl font-bold text-foreground mb-1">
                ${p.amount.toLocaleString()}
              </p>

              {/* User & meta */}
              <p className="text-sm font-medium text-foreground">{getUserName(p.userId)}</p>
              <p className="text-xs text-muted-foreground mb-3">{getUserEmail(p.userId)}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{formatDate(p.date)}</span>
                <span className="font-mono">#{p.id}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <button onClick={() => setViewItem(p)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  View
                </button>
                <button onClick={() => setEditItem(p)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Edit
                </button>
                {p.status !== 'paid' && (
                  <button onClick={() => updateStatus(p.id, 'paid')} title="Mark as Paid"
                    className="py-1.5 px-3 rounded-lg border border-border text-green-600 hover:bg-green-500/10 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {p.status !== 'pending' && (
                  <button onClick={() => updateStatus(p.id, 'pending')} title="Mark as Pending"
                    className="py-1.5 px-3 rounded-lg border border-border text-yellow-600 hover:bg-yellow-500/10 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setDeleteId(p.id)}
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
              <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount hero */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold text-foreground">${viewItem.amount.toLocaleString()}</p>
              </div>
              <StatusBadge status={viewItem.status} />
            </div>

            <dl className="space-y-3 text-sm">
              {[
                { label: 'Payment ID', value: `#${viewItem.id}` },
                { label: 'User',       value: getUserName(viewItem.userId) },
                { label: 'Email',      value: getUserEmail(viewItem.userId) },
                { label: 'Date',       value: formatDate(viewItem.date) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="font-semibold text-foreground w-28 shrink-0">{label}:</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Quick status actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              {viewItem.status !== 'paid' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'paid'); setViewItem({ ...viewItem, status: 'paid' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Mark Paid
                </button>
              )}
              {viewItem.status !== 'pending' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'pending'); setViewItem({ ...viewItem, status: 'pending' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm font-medium hover:bg-yellow-500/20 transition-colors">
                  <XCircle className="w-4 h-4" /> Mark Pending
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
              <h2 className="text-xl font-bold text-foreground">Edit Payment</h2>
              <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              {/* User */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">User</label>
                <select
                  value={editItem.userId}
                  onChange={e => setEditItem({ ...editItem, userId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {mockUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  value={editItem.amount}
                  onChange={e => setEditItem({ ...editItem, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
                <input
                  type="date"
                  value={editItem.date}
                  onChange={e => setEditItem({ ...editItem, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Status pill toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <div className="flex gap-3">
                  {(['paid', 'pending', 'failed'] as Payment['status'][]).map(s => (
                    <button key={s} type="button" onClick={() => setEditItem({ ...editItem, status: s })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        editItem.status === s
                          ? s === 'paid'
                            ? 'bg-green-500/10 border-green-500/40 text-green-600'
                            : s === 'failed'
                            ? 'bg-destructive/10 border-destructive/40 text-destructive'
                            : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-600'
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
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminPaymentManagement;