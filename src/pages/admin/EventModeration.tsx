import React, { useState, useMemo } from 'react';
import { mockEvents } from '@/data/mockData';
import { EventItem } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  CheckCircle, XCircle, Pencil, Trash2, Eye, X,
  List, LayoutGrid, Clock, MapPin, Globe, Phone,
  Link as LinkIcon, Upload, Search, Plus, User,
  Crown, Star, Mail, Calendar, Shield,
} from 'lucide-react';

// ─── Static lookup data ────────────────────────────────────────────────────────

const REGIONS = [
  { id: 1, label: 'North Region' },
  { id: 2, label: 'South Region' },
  { id: 3, label: 'East Region' },
  { id: 4, label: 'West Region' },
  { id: 5, label: 'Central Region' },
];

const CITIES = [
  { id: 1, label: 'New York' },
  { id: 2, label: 'Los Angeles' },
  { id: 3, label: 'Chicago' },
  { id: 4, label: 'Houston' },
  { id: 5, label: 'Phoenix' },
];

const CATEGORIES = [
  { id: 1, label: 'General' },
  { id: 2, label: 'Tech' },
  { id: 3, label: 'Music' },
  { id: 4, label: 'Food' },
  { id: 5, label: 'Art' },
  { id: 6, label: 'Business' },
];

const DIRECTORIES = [
  { id: 1, label: 'Directory A' },
  { id: 2, label: 'Directory B' },
  { id: 3, label: 'Directory C' },
  { id: 4, label: 'Directory D' },
  { id: 5, label: 'Directory E' },
];

const COUNTRIES = [
  { id: 94, label: 'Sri Lanka' },
  { id: 1,  label: 'United States' },
  { id: 44, label: 'United Kingdom' },
  { id: 91, label: 'India' },
  { id: 61, label: 'Australia' },
  { id: 49, label: 'Germany' },
  { id: 33, label: 'France' },
  { id: 81, label: 'Japan' },
];

// ─── Inline mock data (same as mockData.ts) ───────────────────────────────────

const MOCK_USERS = [
  { id: '1', firstName: 'Alice',  lastName: 'Johnson', email: 'alice@example.com',  role: 'user',  phone: '+1 555-0101', city: 'New York',    blocked: false, createdAt: '2024-01-15' },
  { id: '2', firstName: 'Bob',    lastName: 'Smith',   email: 'bob@example.com',    role: 'user',  phone: '+1 555-0102', city: 'Los Angeles', blocked: false, createdAt: '2024-02-20' },
  { id: '3', firstName: 'Carol',  lastName: 'Williams',email: 'carol@example.com',  role: 'user',  phone: '+1 555-0103', city: 'Chicago',     blocked: true,  createdAt: '2024-03-10' },
  { id: '4', firstName: 'David',  lastName: 'Brown',   email: 'david@example.com',  role: 'user',  phone: '+1 555-0104', city: 'Houston',     blocked: false, createdAt: '2024-04-05' },
  { id: '5', firstName: 'Eve',    lastName: 'Davis',   email: 'eve@example.com',    role: 'admin', phone: '+1 555-0105', city: 'Phoenix',     blocked: false, createdAt: '2024-05-12' },
];

const MOCK_SUBSCRIBED_USERS = [
  { id: '1', userId: '1', planId: 'premium', status: 'active',   startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: '2', userId: '2', planId: 'free',    status: 'active',   startDate: '2025-02-01', endDate: 'forever' },
  { id: '3', userId: '3', planId: 'premium', status: 'inactive', startDate: '2024-12-01', endDate: '2024-12-31' },
  { id: '4', userId: '4', planId: 'premium', status: 'active',   startDate: '2025-03-01', endDate: '2025-03-31' },
  { id: '5', userId: '5', planId: 'premium', status: 'inactive', startDate: '2024-11-01', endDate: '2024-11-30' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ModerationStatus = 'pending' | 'approved' | 'rejected';
type EventLink        = { id: string; label: string; url: string };
type ModeratedEvent   = EventItem & { status: ModerationStatus; extraLinks?: EventLink[] };

type MockUser = typeof MOCK_USERS[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelFor = (list: { id: number; label: string }[], id: number, fallback = '—') =>
  list.find(i => i.id === id)?.label ?? fallback;

const seedEvents = (): ModeratedEvent[] =>
  mockEvents.map((ev, i) => ({
    ...ev,
    extraLinks: [],
    status: (['pending', 'approved', 'rejected', 'pending', 'approved'] as ModerationStatus[])[i % 3],
  }));

/** Find mock user by event's userId (can be number or string) */
const getUserForEvent = (userId: number | string | undefined): MockUser | undefined =>
  MOCK_USERS.find(u => String(u.id) === String(userId));

/** Check if user has an active premium subscription */
const isUserPremium = (userId: number | string | undefined): boolean => {
  if (!userId) return false;
  const sub = MOCK_SUBSCRIBED_USERS.find(
    s => String(s.userId) === String(userId)
  );
  return sub?.planId === 'premium' && sub?.status === 'active';
};

/** Get user's subscription info */
const getUserSubscription = (userId: number | string | undefined) =>
  MOCK_SUBSCRIBED_USERS.find(s => String(s.userId) === String(userId));

/** Generate avatar initials */
const getInitials = (user: MockUser) =>
  `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

/** Deterministic color for avatars based on user id */
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];
const avatarColor = (userId: string) =>
  AVATAR_COLORS[parseInt(userId, 10) % AVATAR_COLORS.length];

// ─── Reusable field components ────────────────────────────────────────────────

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-foreground mb-1.5">{children}</label>
);

const TextInput: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
);

const SelectInput: React.FC<{
  label: string; value: number; onChange: (v: number) => void;
  options: { id: number; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select value={value} onChange={e => onChange(Number(e.target.value))}
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Badges ───────────────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ categoryId: number }> = ({ categoryId }) => {
  const map: Record<number, { label: string; style: string }> = {
    1: { label: 'General',  style: 'bg-muted text-muted-foreground' },
    2: { label: 'Tech',     style: 'bg-blue-500/10 text-blue-500' },
    3: { label: 'Music',    style: 'bg-purple-500/10 text-purple-500' },
    4: { label: 'Food',     style: 'bg-orange-500/10 text-orange-500' },
    5: { label: 'Art',      style: 'bg-pink-500/10 text-pink-500' },
    6: { label: 'Business', style: 'bg-green-500/10 text-green-600' },
  };
  const cat = map[categoryId] ?? { label: `Cat ${categoryId}`, style: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.style}`}>
      {cat.label}
    </span>
  );
};

const StatusBadge: React.FC<{ status: ModerationStatus }> = ({ status }) => {
  const map: Record<ModerationStatus, string> = {
    approved: 'bg-green-500/10 text-green-600',
    pending:  'bg-yellow-500/10 text-yellow-600',
    rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  );
};

/** Premium or Normal plan badge */
const PlanBadge: React.FC<{ userId: number | string | undefined }> = ({ userId }) => {
  const premium = isUserPremium(userId);
  return premium ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
      <Crown className="w-3 h-3" />
      Premium
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
      <Star className="w-3 h-3" />
      Free
    </span>
  );
};

/** Compact avatar button that opens the user popup */
const UserAvatarButton: React.FC<{
  userId: number | string | undefined;
  onClick: (user: MockUser) => void;
}> = ({ userId, onClick }) => {
  const user = getUserForEvent(userId);
  if (!user) return null;

  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick(user); }}
      title={`${user.firstName} ${user.lastName}`}
      className={`
        relative w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold
        ${avatarColor(user.id)} hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all shrink-0
      `}
    >
      {getInitials(user)}
      {isUserPremium(user.id) && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
          <Crown className="w-2 h-2 text-white" />
        </span>
      )}
    </button>
  );
};

// ─── User Detail Modal ────────────────────────────────────────────────────────

const UserDetailModal: React.FC<{
  user: MockUser;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const sub = getUserSubscription(user.id);
  const isPremium = isUserPremium(user.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            text-white text-xl font-bold mb-3 ${avatarColor(user.id)}
          `}>
            {getInitials(user)}
            {isPremium && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                <Crown className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <PlanBadge userId={user.id} />
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
            {user.blocked && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/30">
                Blocked
              </span>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground break-all">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{user.city}</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Subscription block */}
        {sub && (
          <div className={`
            mt-4 p-3 rounded-lg border
            ${isPremium
              ? 'bg-amber-500/5 border-amber-500/25'
              : 'bg-muted/40 border-border'}
          `}>
            <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5
              ${isPremium ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
              {isPremium ? 'Premium Plan' : 'Free Plan'}
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium
                ${sub.status === 'active'
                  ? 'bg-green-500/15 text-green-600'
                  : 'bg-muted text-muted-foreground'}`}>
                {sub.status}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <p className="text-[10px] uppercase tracking-wide font-medium mb-0.5">Start</p>
                <p className="text-foreground">{sub.startDate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-medium mb-0.5">End</p>
                <p className="text-foreground">{sub.endDate === 'forever' ? '∞ Forever' : sub.endDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EventModeration: React.FC = () => {
  const [events, setEvents]             = useState<ModeratedEvent[]>(seedEvents());
  const [view, setView]                 = useState<'table' | 'card'>('table');
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [editItem, setEditItem]         = useState<ModeratedEvent | null>(null);
  const [viewItem, setViewItem]         = useState<ModeratedEvent | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [userPopup, setUserPopup]       = useState<MockUser | null>(null);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter(ev => {
      const matchCat = activeCategory === 0 || ev.CategoryId === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const user = getUserForEvent(ev.userId);
      return (
        ev.Event.toLowerCase().includes(q) ||
        String(ev.EventID).includes(q) ||
        new Date(ev.EventDate).toLocaleDateString().includes(q) ||
        ev.Venue.toLowerCase().includes(q) ||
        ev.Contact.toLowerCase().includes(q) ||
        ev.status.toLowerCase().includes(q) ||
        labelFor(CITIES,     ev.CityId).toLowerCase().includes(q) ||
        labelFor(REGIONS,    ev.RegionId).toLowerCase().includes(q) ||
        labelFor(CATEGORIES, ev.CategoryId).toLowerCase().includes(q) ||
        (user ? `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) : false)
      );
    });
  }, [events, search, activeCategory]);

  // ── Stat counts ──────────────────────────────────────────────────────────

  const counts = {
    total:    events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending:  events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const updateStatus = (id: number, status: ModerationStatus) =>
    setEvents(prev => prev.map(ev => ev.EventID === id ? { ...ev, status } : ev));

  const handleDelete = () => {
    if (deleteId !== null) setEvents(prev => prev.filter(ev => ev.EventID !== deleteId));
    setDeleteId(null);
  };

  const openEdit = (ev: ModeratedEvent) => {
    setEditItem({ ...ev });
    setImagePreview(ev.Image || '');
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setEvents(prev => prev.map(ev => ev.EventID === editItem.EventID ? editItem : ev));
    setEditItem(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem) return;
    setImagePreview(URL.createObjectURL(file));
    setEditItem({ ...editItem, Image: file.name });
  };

  const set = <K extends keyof ModeratedEvent>(key: K, value: ModeratedEvent[K]) =>
    setEditItem(prev => prev ? { ...prev, [key]: value } : prev);

  const addLink = () =>
    setEditItem(prev => prev ? ({
      ...prev,
      extraLinks: [...(prev.extraLinks || []), { id: Date.now().toString(), label: '', url: '' }],
    }) : prev);

  const updateLink = (id: string, field: 'label' | 'url', value: string) =>
    setEditItem(prev => prev ? ({
      ...prev,
      extraLinks: (prev.extraLinks || []).map(l => l.id === id ? { ...l, [field]: value } : l),
    }) : prev);

  const removeLink = (id: string) =>
    setEditItem(prev => prev ? ({
      ...prev,
      extraLinks: (prev.extraLinks || []).filter(l => l.id !== id),
    }) : prev);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and moderate events submitted by users
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
          { label: 'Total',    value: counts.total,    style: 'text-foreground' },
          { label: 'Approved', value: counts.approved, style: 'text-green-600' },
          { label: 'Pending',  value: counts.pending,  style: 'text-yellow-600' },
          { label: 'Rejected', value: counts.rejected, style: 'text-destructive' },
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
          placeholder="Search by name, ID, date, venue, city, region, category, status, user…"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(0)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 0 ? 'gradient-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.id ? 'gradient-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No events found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
        </div>
      )}

      {/* ── Table View ── */}
      {view === 'table' && filtered.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Venue</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => {
                  const user = getUserForEvent(ev.userId);
                  return (
                    <tr key={ev.EventID} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {/* User avatar chip */}
                          <UserAvatarButton userId={ev.userId} onClick={setUserPopup} />
                          <div>
                            <div className="text-sm font-medium text-foreground">{ev.Event}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ID: {ev.EventID}
                              {user && <span className="ml-1">· {user.firstName} {user.lastName}</span>}
                              {' · '}{labelFor(CITIES, ev.CityId)} · {labelFor(REGIONS, ev.RegionId)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(ev.EventDate).toLocaleDateString()}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">{ev.Venue}</td>
                      <td className="hidden lg:table-cell px-4 py-3"><CategoryBadge categoryId={ev.CategoryId} /></td>
                      <td className="hidden sm:table-cell px-4 py-3"><PlanBadge userId={ev.userId} /></td>
                      <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewItem(ev)} title="View"
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {ev.status !== 'approved' && (
                            <button onClick={() => updateStatus(ev.EventID, 'approved')} title="Approve"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {ev.status !== 'rejected' && (
                            <button onClick={() => updateStatus(ev.EventID, 'rejected')} title="Reject"
                              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openEdit(ev)} title="Edit"
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(ev.EventID)} title="Delete"
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {user && (
                            <button
                              onClick={() => setUserPopup(user)}
                              title={`View user: ${user.firstName} ${user.lastName}`}
                              className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card View ── */}
      {view === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ev => {
            const user = getUserForEvent(ev.userId);
            return (
              <div key={ev.EventID} className="glass-card hover-lift p-5 flex flex-col">
                <div className="w-full h-32 rounded-lg bg-muted mb-4 overflow-hidden flex items-center justify-center">
                  {ev.Image
                    ? <img src={ev.Image} alt={ev.Event} className="w-full h-full object-cover" />
                    : <Upload className="w-8 h-8 text-muted-foreground/40" />
                  }
                </div>

                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">{ev.Event}</h3>
                    <span className="text-xs text-muted-foreground">ID: {ev.EventID}</span>
                  </div>
                  <CategoryBadge categoryId={ev.CategoryId} />
                </div>

                {/* Plan + Status row */}
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={ev.status} />
                  <PlanBadge userId={ev.userId} />
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  {/* User row */}
                  {user && (
                    <div className="flex items-center gap-2">
                      <UserAvatarButton userId={ev.userId} onClick={setUserPopup} />
                      <span className="text-foreground font-medium text-xs">
                        {user.firstName} {user.lastName}
                      </span>
                      {user.role === 'admin' && (
                        <Shield className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {new Date(ev.EventDate).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {ev.Venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    {labelFor(REGIONS, ev.RegionId)} · {labelFor(CITIES, ev.CityId)}
                  </div>
                  {ev.Contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {ev.Contact}
                    </div>
                  )}
                  {ev.Link && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <a href={ev.Link} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline truncate">{ev.Link}</a>
                    </div>
                  )}
                  {(ev.extraLinks || []).map(l => (
                    <div key={l.id} className="flex items-center gap-2 pl-1">
                      <LinkIcon className="w-3 h-3 shrink-0 text-muted-foreground/50" />
                      <a href={l.url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline truncate text-xs">{l.label || l.url}</a>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => setViewItem(ev)}
                    className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    View
                  </button>
                  <button onClick={() => openEdit(ev)}
                    className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Edit
                  </button>
                  {ev.status !== 'approved' && (
                    <button onClick={() => updateStatus(ev.EventID, 'approved')} title="Approve"
                      className="py-1.5 px-3 rounded-lg border border-border text-green-600 hover:bg-green-500/10 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {ev.status !== 'rejected' && (
                    <button onClick={() => updateStatus(ev.EventID, 'rejected')} title="Reject"
                      className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setDeleteId(ev.EventID)}
                    className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ── User strip below actions ── */}
                {user && (
                  <button
                    type="button"
                    onClick={() => setUserPopup(user)}
                    className="mt-3 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(user.id)}`}>
                      {getInitials(user)}
                      {isUserPremium(user.id) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                          <Crown className="w-2 h-2 text-white" />
                        </span>
                      )}
                    </div>
                    {/* Name + email */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight truncate">
                        {user.firstName} {user.lastName}
                        {user.role === 'admin' && (
                          <Shield className="inline w-3 h-3 text-blue-500 ml-1 -mt-0.5" />
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {/* Plan badge */}
                    <PlanBadge userId={user.id} />
                    {/* Arrow hint */}
                    <User className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (() => {
        const viewUser = getUserForEvent(viewItem.userId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewItem(null)} />
            <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{viewItem.Event}</h2>
                <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {viewItem.Image && (
                <div className="w-full h-40 rounded-lg bg-muted mb-5 overflow-hidden">
                  <img src={viewItem.Image} alt={viewItem.Event} className="w-full h-full object-cover" />
                </div>
              )}

              {/* ── Submitted By block ── */}
              {viewUser && (
                <div className="mb-5 p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Submitted By
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUserPopup(viewUser)}
                      className={`
                        relative w-10 h-10 rounded-full flex items-center justify-center
                        text-white text-sm font-bold ${avatarColor(viewUser.id)}
                        hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all
                      `}
                      title="View user details"
                    >
                      {getInitials(viewUser)}
                      {isUserPremium(viewUser.id) && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {viewUser.firstName} {viewUser.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{viewUser.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PlanBadge userId={viewUser.id} />
                      {viewUser.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserPopup(viewUser)}
                    className="mt-3 w-full text-xs text-primary hover:underline text-center"
                  >
                    View full user profile →
                  </button>
                </div>
              )}

              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Event ID',    value: String(viewItem.EventID) },
                  { label: 'Date & Time', value: new Date(viewItem.EventDate).toLocaleString() },
                  { label: 'Venue',       value: viewItem.Venue },
                  { label: 'Contact',     value: viewItem.Contact },
                  { label: 'Region',      value: labelFor(REGIONS,     viewItem.RegionId) },
                  { label: 'City',        value: labelFor(CITIES,      viewItem.CityId) },
                  { label: 'Country',     value: labelFor(COUNTRIES,   viewItem.CountryId) },
                  { label: 'Directory',   value: labelFor(DIRECTORIES, viewItem.DirectoryId) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <dt className="font-semibold text-foreground w-28 shrink-0">{label}:</dt>
                    <dd className="text-muted-foreground">{value}</dd>
                  </div>
                ))}
                <div className="flex gap-2 items-center">
                  <dt className="font-semibold text-foreground w-28 shrink-0">Category:</dt>
                  <dd><CategoryBadge categoryId={viewItem.CategoryId} /></dd>
                </div>
                <div className="flex gap-2 items-center">
                  <dt className="font-semibold text-foreground w-28 shrink-0">Plan:</dt>
                  <dd><PlanBadge userId={viewItem.userId} /></dd>
                </div>
                <div className="flex gap-2 items-center">
                  <dt className="font-semibold text-foreground w-28 shrink-0">Status:</dt>
                  <dd><StatusBadge status={viewItem.status} /></dd>
                </div>
                {viewItem.Link && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-foreground w-28 shrink-0">Main Link:</dt>
                    <dd>
                      <a href={viewItem.Link} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline break-all">{viewItem.Link}</a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Extra links */}
              {(viewItem.extraLinks || []).length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Additional Links
                  </p>
                  <div className="space-y-2">
                    {viewItem.extraLinks!.map(l => (
                      <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                        <span className="text-sm font-medium text-foreground">{l.label || 'Link'}</span>
                        <span className="text-xs text-primary group-hover:underline truncate max-w-[180px]">{l.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                {viewItem.status !== 'approved' && (
                  <button
                    onClick={() => { updateStatus(viewItem.EventID, 'approved'); setViewItem({ ...viewItem, status: 'approved' }); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                {viewItem.status !== 'rejected' && (
                  <button
                    onClick={() => { updateStatus(viewItem.EventID, 'rejected'); setViewItem({ ...viewItem, status: 'rejected' }); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Event</h2>
              <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">

              {/* Image upload */}
              <div>
                <FieldLabel>Poster / Image</FieldLabel>
                <label className="block border-2 border-dashed border-input rounded-lg p-5 text-center hover:border-primary transition-colors cursor-pointer">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="h-36 mx-auto rounded-lg object-cover mb-2" />
                      <p className="text-xs text-muted-foreground">{editItem.Image} · Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10 MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <TextInput label="Event Name" value={editItem.Event} onChange={v => set('Event', v)} placeholder="e.g. Tech Conference 2025" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="Date & Time" type="datetime-local" value={editItem.EventDate} onChange={v => set('EventDate', v)} />
                <TextInput label="Main Event Link" value={editItem.Link} onChange={v => set('Link', v)} placeholder="https://example.com" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput label="Region" value={editItem.RegionId} onChange={v => set('RegionId', v)} options={REGIONS} />
                <SelectInput label="City"   value={editItem.CityId}   onChange={v => set('CityId', v)}   options={CITIES} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput label="Category"  value={editItem.CategoryId}  onChange={v => set('CategoryId', v)}  options={CATEGORIES} />
                <SelectInput label="Directory" value={editItem.DirectoryId} onChange={v => set('DirectoryId', v)} options={DIRECTORIES} />
              </div>

              <SelectInput label="Country" value={editItem.CountryId} onChange={v => set('CountryId', v)} options={COUNTRIES} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="Venue"   value={editItem.Venue}   onChange={v => set('Venue', v)}   placeholder="Convention Center" />
                <TextInput label="Contact" value={editItem.Contact} onChange={v => set('Contact', v)} placeholder="email@example.com" />
              </div>

              {/* Additional Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FieldLabel>
                    Additional Links
                    {(editItem.extraLinks || []).length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({(editItem.extraLinks || []).length})
                      </span>
                    )}
                  </FieldLabel>
                  <button type="button" onClick={addLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
                {(editItem.extraLinks || []).length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg py-6 text-center">
                    <LinkIcon className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No additional links</p>
                    <button type="button" onClick={addLink} className="mt-2 text-xs text-primary hover:underline">+ Add link</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(editItem.extraLinks || []).map((link, idx) => (
                      <div key={link.id} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input type="text" value={link.label}
                            onChange={e => updateLink(link.id, 'label', e.target.value)}
                            placeholder="Label (e.g. Register)"
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                          <input type="url" value={link.url}
                            onChange={e => updateLink(link.id, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                        </div>
                        <button type="button" onClick={() => removeLink(link.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Moderation Status */}
              <div>
                <FieldLabel>Moderation Status</FieldLabel>
                <div className="flex gap-3">
                  {(['pending', 'approved', 'rejected'] as ModerationStatus[]).map(s => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        editItem.status === s
                          ? s === 'approved'
                            ? 'bg-green-500/10 border-green-500/40 text-green-600'
                            : s === 'rejected'
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

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* ── User Detail Popup ── */}
      {userPopup && (
        <UserDetailModal user={userPopup} onClose={() => setUserPopup(null)} />
      )}
    </div>
  );
};

export default EventModeration;