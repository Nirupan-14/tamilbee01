import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { User } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  ShieldCheck, ShieldOff, Mail, Phone, Eye, X,
  MapPin, List, LayoutGrid, Search, Pencil, Trash2,
  Crown, Star, Calendar, Shield, Upload, Loader2,
  ChevronLeft, ChevronRight, Users, UserCog,
} from 'lucide-react';

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
});

// ─── API User type (from backend) ────────────────────────────────────────────

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  status: 'active' | 'deactive';
  user_role: 'user' | 'admin';
  email_verified_at: string | null;
  created_at: string;
}

interface ApiMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// ─── Map API → local User type ───────────────────────────────────────────────

const mapApiUser = (u: ApiUser): User => ({
  id: String(u.id),
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  phone: u.phone || '',
  address: u.address || '',
  city: u.city || '',
  role: u.user_role,
  blocked: u.status === 'deactive',
  createdAt: u.created_at,
});

// ─── Random plan (placeholder until API provides it) ─────────────────────────

const PLANS = ['free', 'silver', 'gold'] as const;
type Plan = typeof PLANS[number];
const getUserPlan = (id: string): Plan => PLANS[parseInt(id, 10) % PLANS.length];

// ─── Inline subscription helper using random plan ─────────────────────────────

const isUserPremium = (userId: string): boolean => {
  const plan = getUserPlan(userId);
  return plan !== 'free';
};

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ blocked: boolean }> = ({ blocked }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    blocked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
  }`}>
    {blocked ? 'Deactive' : 'Active'}
  </span>
);

const PlanBadge: React.FC<{ userId: string }> = ({ userId }) => {
  const plan = getUserPlan(userId);
  if (plan === 'gold') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
        <Crown className="w-3 h-3" /> Gold
      </span>
    );
  }
  if (plan === 'silver') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-400/15 text-slate-500 border border-slate-400/30">
        <Star className="w-3 h-3" /> Silver
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
      <Star className="w-3 h-3" /> Free
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

const Avatar: React.FC<{ user: User; size?: 'sm' | 'lg' }> = ({ user, size = 'sm' }) => {
  const color = AVATAR_COLORS[parseInt(user.id, 10) % AVATAR_COLORS.length];
  const isPremium = isUserPremium(user.id);
  return (
    <div className={`relative rounded-full ${color} flex items-center justify-center text-white font-semibold flex-shrink-0 ${
      size === 'lg' ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-sm'
    }`}>
      {user.firstName[0]}{user.lastName[0]}
      {isPremium && (
        <span className={`absolute bg-amber-500 rounded-full flex items-center justify-center shadow ${
          size === 'lg' ? '-top-1 -right-1 w-5 h-5' : '-top-0.5 -right-0.5 w-3.5 h-3.5'
        }`}>
          <Crown className={size === 'lg' ? 'w-3 h-3 text-white' : 'w-2 h-2 text-white'} />
        </span>
      )}
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditUserModal: React.FC<{
  user: User;
  onSave: (updated: User) => void;
  onClose: () => void;
  saving: boolean;
}> = ({ user, onSave, onClose, saving }) => {
  const [form, setForm] = useState<User>({ ...user });

  const set = <K extends keyof User>(key: K, value: User[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const Field: React.FC<{
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string;
  }> = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit User</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border mb-6">
          <Avatar user={form} size="lg" />
          <div>
            <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
            <p className="text-xs text-muted-foreground mb-1.5">ID: {form.id}</p>
            <div className="flex items-center gap-2">
              <PlanBadge userId={form.id} />
              <StatusBadge blocked={form.blocked} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" value={form.firstName} onChange={v => set('firstName', v)} placeholder="First name" />
            <Field label="Last Name"  value={form.lastName}  onChange={v => set('lastName', v)}  placeholder="Last name" />
          </div>

          {/* Email */}
          <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" placeholder="email@example.com" />

          {/* Phone */}
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+1 555-0000" />

          {/* Block toggle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Status</label>
            <div className="flex gap-3">
              {[false, true].map(blocked => (
                <button key={String(blocked)} type="button" onClick={() => set('blocked', blocked)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.blocked === blocked
                      ? blocked
                        ? 'bg-destructive/10 border-destructive/40 text-destructive'
                        : 'bg-green-500/10 border-green-500/40 text-green-600'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  {blocked ? 'Deactive' : 'Active'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => onSave(form)} disabled={saving}
              className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination: React.FC<{
  meta: ApiMeta;
  onPageChange: (page: number) => void;
}> = ({ meta, onPageChange }) => {
  if (meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground">
        Showing {meta.from}–{meta.to} of {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page === 1}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
              page === meta.current_page
                ? 'gradient-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page === meta.last_page}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  // ── Tab: users vs admins ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  // ── Data state ────────────────────────────────────────────────────────────
  const [users, setUsers]       = useState<User[]>([]);
  const [meta, setMeta]         = useState<ApiMeta | null>(null);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [statCounts, setStatCounts] = useState({ total: 0, active: 0, deactive: 0 });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [view, setView]         = useState<'table' | 'card'>('table');
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Blocked'>('All');
  const [page, setPage]         = useState(1);
  const [saving, setSaving]     = useState(false);

  // ── Debounced search ──────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Reset page when tab or filter changes
  useEffect(() => { setPage(1); }, [activeTab, activeFilter]);

  // ── Fetch real stat counts (all 3 in parallel) ───────────────────────────
  const fetchStatCounts = useCallback(async () => {
    const endpoint = activeTab === 'users'
      ? `${API_BASE}/auth/admin/users`
      : `${API_BASE}/auth/admin/admins`;
    try {
      const [resAll, resActive, resDeactive] = await Promise.all([
        fetch(`${endpoint}?per_page=1&page=1`, { headers: getAuthHeaders() }),
        fetch(`${endpoint}?per_page=1&page=1&status=active`, { headers: getAuthHeaders() }),
        fetch(`${endpoint}?per_page=1&page=1&status=deactive`, { headers: getAuthHeaders() }),
      ]);
      const [dAll, dActive, dDeactive] = await Promise.all([
        resAll.json(), resActive.json(), resDeactive.json(),
      ]);
      setStatCounts({
        total:    dAll.data?.meta?.total     ?? 0,
        active:   dActive.data?.meta?.total  ?? 0,
        deactive: dDeactive.data?.meta?.total ?? 0,
      });
    } catch { /* non-critical */ }
  }, [activeTab]);

  // ── Fetch users/admins ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const endpoint = activeTab === 'users'
        ? `${API_BASE}/auth/admin/users`
        : `${API_BASE}/auth/admin/admins`;

      const statusParam =
        activeFilter === 'Active'  ? 'active' :
        activeFilter === 'Blocked' ? 'deactive' : '';

      const params = new URLSearchParams({
        per_page: '15',
        page: String(page),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusParam && { status: statusParam }),
      });

      const res = await fetch(`${endpoint}?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.msg || 'Failed to load users.');
        return;
      }

      setUsers((data.data.data as ApiUser[]).map(mapApiUser));
      setMeta(data.data.meta as ApiMeta);
    } catch {
      setApiError('Unable to connect. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, debouncedSearch, activeFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStatCounts(); }, [fetchStatCounts]);

  // ── Stat counts from real API totals ──────────────────────────────────────
  const counts = {
    total:   statCounts.total,
    active:  statCounts.active,
    blocked: statCounts.deactive,
  };

  // ── Toggle Block / Unblock via PATCH status ───────────────────────────────
  const toggleBlock = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.blocked ? 'active' : 'deactive';
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u));
    if (viewUser?.id === id) setViewUser(prev => prev ? { ...prev, blocked: !prev.blocked } : prev);

    try {
      const res = await fetch(`${API_BASE}/auth/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on failure
        setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: user.blocked } : u));
        if (viewUser?.id === id) setViewUser(prev => prev ? { ...prev, blocked: user.blocked } : prev);
      } else {
        fetchStatCounts();
      }
    } catch {
      // Revert
      setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: user.blocked } : u));
      if (viewUser?.id === id) setViewUser(prev => prev ? { ...prev, blocked: user.blocked } : prev);
    }
  };

  // ── Edit / Save via PUT ───────────────────────────────────────────────────
  const handleEditSave = async (updated: User) => {
    setSaving(true);
    try {
      const body: Record<string, string> = {
        first_name: updated.firstName,
        last_name:  updated.lastName,
        email:      updated.email,
        phone:      updated.phone,
        status:     updated.blocked ? 'deactive' : 'active',
      };

      const res = await fetch(`${API_BASE}/auth/admin/users/${updated.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setEditUser(null);
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  // ── Delete via DELETE ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/auth/admin/users/${deleteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.filter(u => u.id !== deleteId));
        if (meta) setMeta(m => m ? { ...m, total: m.total - 1 } : m);
        fetchStatCounts();
      }
    } catch {
      // silent fail
    } finally {
      setDeleteId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta ? `${meta.total} total ${activeTab}` : `${users.length} ${activeTab}`}
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

      {/* ── Users / Admins Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'gradient-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === 'admins'
              ? 'gradient-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          <UserCog className="w-4 h-4" /> Admins
        </button>
      </div>

      {/* ── Stat chips ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: counts.total,   style: 'text-foreground' },
          { label: 'Active',   value: counts.active,  style: 'text-green-600' },
          { label: 'Deactive', value: counts.blocked, style: 'text-destructive' },
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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone…"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {search && (
          <button onClick={() => { setSearch(''); setDebouncedSearch(''); }}
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
            {f === 'Blocked' ? 'Deactive' : f}
          </button>
        ))}
      </div>

      {/* ── API Error ── */}
      {apiError && (
        <div className="glass-card py-6 text-center">
          <p className="text-sm font-medium text-destructive">{apiError}</p>
          <button onClick={fetchUsers} className="mt-2 text-xs text-muted-foreground underline">Try again</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="glass-card py-12 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading {activeTab}…</span>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !apiError && users.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No {activeTab} found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term or filter</p>
        </div>
      )}

      {/* ── Table View ── */}
      {!loading && !apiError && view === 'table' && users.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
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
                    <td className="hidden sm:table-cell px-4 py-3">
                      <PlanBadge userId={user.id} />
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
                        <button onClick={() => setEditUser(user)} title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(user.id)} title="Delete"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
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
                            ? <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                            : <><ShieldOff  className="w-3.5 h-3.5" /> Deactivate</>
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
      {!loading && !apiError && view === 'card' && users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="glass-card hover-lift p-5 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusBadge blocked={user.blocked} />
                    <PlanBadge userId={user.id} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {user.phone || '—'}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setViewUser(user)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  View
                </button>
                <button onClick={() => setEditUser(user)} title="Edit"
                  className="py-1.5 px-3 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(user.id)} title="Delete"
                  className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
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
                    ? <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                    : <><ShieldOff  className="w-3.5 h-3.5" /> Deactivate</>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !apiError && meta && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* ── View Modal ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewUser(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{viewUser.firstName} {viewUser.lastName}</h2>
              <button onClick={() => setViewUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/40">
              <Avatar user={viewUser} size="lg" />
              <div>
                <p className="font-semibold text-foreground">{viewUser.firstName} {viewUser.lastName}</p>
                <p className="text-xs text-muted-foreground mb-2">ID: {viewUser.id}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge blocked={viewUser.blocked} />
                  <PlanBadge userId={viewUser.id} />
                  {viewUser.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              {[
                { label: 'Email',  icon: <Mail className="w-4 h-4" />,     value: viewUser.email },
                { label: 'Phone',  icon: <Phone className="w-4 h-4" />,    value: viewUser.phone },
                { label: 'Joined', icon: <Calendar className="w-4 h-4" />, value: new Date(viewUser.createdAt).toLocaleDateString() },
              ].map(({ label, icon, value }) => value ? (
                <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">{icon}</span>
                  <div>
                    <span className="font-medium text-foreground">{label}: </span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                </div>
              ) : null)}
            </dl>

            {/* Plan block */}
            <div className={`mt-4 p-3 rounded-lg border ${
              getUserPlan(viewUser.id) === 'gold'
                ? 'bg-amber-500/5 border-amber-500/25'
                : getUserPlan(viewUser.id) === 'silver'
                ? 'bg-slate-400/5 border-slate-400/25'
                : 'bg-muted/40 border-border'
            }`}>
              <p className={`text-xs font-semibold flex items-center gap-1.5 ${
                getUserPlan(viewUser.id) === 'gold'   ? 'text-amber-600' :
                getUserPlan(viewUser.id) === 'silver' ? 'text-slate-500' : 'text-muted-foreground'
              }`}>
                {getUserPlan(viewUser.id) !== 'free' ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                {getUserPlan(viewUser.id).charAt(0).toUpperCase() + getUserPlan(viewUser.id).slice(1)} Plan
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                  temp
                </span>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <button onClick={() => setEditUser(viewUser)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => toggleBlock(viewUser.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewUser.blocked
                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                }`}
              >
                {viewUser.blocked
                  ? <><ShieldCheck className="w-4 h-4" /> Activate</>
                  : <><ShieldOff  className="w-4 h-4" /> Deactivate</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onSave={handleEditSave}
          onClose={() => setEditUser(null)}
          saving={saving}
        />
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default UserManagement;