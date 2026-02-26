import React, { useState, useMemo } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Eye, Trash2, X, Mail, Phone, Globe, MapPin,
  List, LayoutGrid, Search, CheckCircle, XCircle,
  ExternalLink, Building2, Pencil, User,
  Crown, Star, Calendar, Shield, Upload,
} from 'lucide-react';

// ─── Inline mock data ─────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: '1', firstName: 'Alice',  lastName: 'Johnson',  email: 'alice@example.com',  role: 'user',  phone: '+1 555-0101', city: 'New York',    blocked: false, createdAt: '2024-01-15' },
  { id: '2', firstName: 'Bob',    lastName: 'Smith',    email: 'bob@example.com',    role: 'user',  phone: '+1 555-0102', city: 'Los Angeles', blocked: false, createdAt: '2024-02-20' },
  { id: '3', firstName: 'Carol',  lastName: 'Williams', email: 'carol@example.com',  role: 'user',  phone: '+1 555-0103', city: 'Chicago',     blocked: true,  createdAt: '2024-03-10' },
  { id: '4', firstName: 'David',  lastName: 'Brown',    email: 'david@example.com',  role: 'user',  phone: '+1 555-0104', city: 'Houston',     blocked: false, createdAt: '2024-04-05' },
  { id: '5', firstName: 'Eve',    lastName: 'Davis',    email: 'eve@example.com',    role: 'admin', phone: '+1 555-0105', city: 'Phoenix',     blocked: false, createdAt: '2024-05-12' },
];

const MOCK_SUBSCRIBED_USERS = [
  { id: '1', userId: '1', planId: 'premium', status: 'active',   startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: '2', userId: '2', planId: 'free',    status: 'active',   startDate: '2025-02-01', endDate: 'forever' },
  { id: '3', userId: '3', planId: 'premium', status: 'inactive', startDate: '2024-12-01', endDate: '2024-12-31' },
  { id: '4', userId: '4', planId: 'premium', status: 'active',   startDate: '2025-03-01', endDate: '2025-03-31' },
  { id: '5', userId: '5', planId: 'premium', status: 'inactive', startDate: '2024-11-01', endDate: '2024-11-30' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ModerationStatus = 'Approved' | 'Pending' | 'Rejected';
type MockUser = typeof MOCK_USERS[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserById = (userId: string | undefined): MockUser | undefined =>
  MOCK_USERS.find(u => u.id === String(userId ?? ''));

const isUserPremium = (userId: string | undefined): boolean => {
  if (!userId) return false;
  const sub = MOCK_SUBSCRIBED_USERS.find(s => s.userId === String(userId));
  return sub?.planId === 'premium' && sub?.status === 'active';
};

const getUserSubscription = (userId: string | undefined) =>
  MOCK_SUBSCRIBED_USERS.find(s => s.userId === String(userId ?? ''));

const getInitials = (user: MockUser) =>
  `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];
const avatarColor = (userId: string) =>
  AVATAR_COLORS[parseInt(userId, 10) % AVATAR_COLORS.length];

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-500/10 text-green-600',
    Pending:  'bg-yellow-500/10 text-yellow-600',
    Rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const map: Record<string, string> = {
    'Technology':          'bg-blue-500/10 text-blue-500',
    'Marketing':           'bg-purple-500/10 text-purple-500',
    'Food & Beverage':     'bg-orange-500/10 text-orange-500',
    'Health & Fitness':    'bg-green-500/10 text-green-600',
    'Education':           'bg-pink-500/10 text-pink-500',
    'Fashion & Lifestyle': 'bg-rose-500/10 text-rose-500',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[category] ?? 'bg-muted text-muted-foreground'}`}>
      {category}
    </span>
  );
};

const PlanBadge: React.FC<{ userId: string | undefined }> = ({ userId }) => {
  const premium = isUserPremium(userId);
  return premium ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
      <Crown className="w-3 h-3" /> Premium
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
      <Star className="w-3 h-3" /> Free
    </span>
  );
};

// ─── User Detail Modal ────────────────────────────────────────────────────────

const UserDetailModal: React.FC<{ user: MockUser; onClose: () => void }> = ({ user, onClose }) => {
  const sub       = getUserSubscription(user.id);
  const isPremium = isUserPremium(user.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">

        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 ${avatarColor(user.id)}`}>
            {getInitials(user)}
            {isPremium && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                <Crown className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground">{user.firstName} {user.lastName}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
            <PlanBadge userId={user.id} />
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                <Shield className="w-3 h-3" /> Admin
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
          {[
            { icon: <Mail className="w-4 h-4 text-muted-foreground shrink-0" />,     value: user.email },
            { icon: <Phone className="w-4 h-4 text-muted-foreground shrink-0" />,    value: user.phone },
            { icon: <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />,   value: user.city },
            { icon: <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />, value: `Member since ${new Date(user.createdAt).toLocaleDateString()}` },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
              {row.icon}
              <span className="text-foreground break-all">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Subscription block */}
        {sub && (
          <div className={`mt-4 p-3 rounded-lg border ${isPremium ? 'bg-amber-500/5 border-amber-500/25' : 'bg-muted/40 border-border'}`}>
            <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${isPremium ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
              {isPremium ? 'Premium Plan' : 'Free Plan'}
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sub.status === 'active' ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'}`}>
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditBusinessModal: React.FC<{
  item: Business;
  onSave: (updated: Business) => void;
  onClose: () => void;
}> = ({ item, onSave, onClose }) => {
  const [form, setForm]           = useState<Business>({ ...item });
  const [imagePreview, setPreview] = useState(item.posterUrl || '');

  const set = <K extends keyof Business>(key: K, value: Business[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    set('posterUrl', file.name);
  };

  const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> =
    ({ label, value, onChange, type = 'text', placeholder }) => (
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Business</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">

          {/* Poster upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Poster / Image</label>
            <label className="block border-2 border-dashed border-input rounded-lg p-5 text-center hover:border-primary transition-colors cursor-pointer">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="h-36 mx-auto rounded-lg object-cover mb-2" />
                  <p className="text-xs text-muted-foreground">Click to change</p>
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

          {/* Title + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title"   value={form.title}   onChange={v => set('title', v)}   placeholder="e.g. Digital Solutions" />
            <Field label="Company" value={form.company} onChange={v => set('company', v)} placeholder="e.g. TechCorp Inc." />
          </div>

          {/* Contact + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Person" value={form.contact} onChange={v => set('contact', v)} placeholder="Full name" />
            <Field label="Email"          value={form.email}   onChange={v => set('email', v)}   type="email" placeholder="email@example.com" />
          </div>

          {/* Phone + Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone"  value={form.telephone} onChange={v => set('telephone', v)} placeholder="+1 555-0000" />
            <Field label="Mobile" value={form.mobile}    onChange={v => set('mobile', v)}    placeholder="+1 555-0001" />
          </div>

          {/* Address */}
          <Field label="Address" value={form.addressLine1} onChange={v => set('addressLine1', v)} placeholder="Street address" />

          {/* City + Province + Postcode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City"     value={form.cityId}     onChange={v => set('cityId', v)}     placeholder="NYC" />
            <Field label="Province" value={form.provinceId} onChange={v => set('provinceId', v)} placeholder="NY" />
            <Field label="Postcode" value={form.postcode}   onChange={v => set('postcode', v)}   placeholder="10001" />
          </div>

          {/* Website */}
          <Field label="Website" value={form.website} onChange={v => set('website', v)} type="url" placeholder="https://example.com" />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Short description of the business…"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Social Links</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { label: 'Facebook',  key: 'facebookLink'  as const },
                { label: 'Twitter',   key: 'twitterLink'   as const },
                { label: 'LinkedIn',  key: 'linkedinLink'  as const },
                { label: 'Instagram', key: 'instagramLink' as const },
                { label: 'YouTube',   key: 'youtubeLink'   as const },
              ]).map(s => (
                <Field key={s.key} label={s.label} value={(form[s.key] as string) || ''} onChange={v => set(s.key, v)} placeholder={`https://${s.label.toLowerCase()}.com/…`} />
              ))}
            </div>
          </div>

          {/* Moderation Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Moderation Status</label>
            <div className="flex gap-3">
              {(['Pending', 'Approved', 'Rejected'] as ModerationStatus[]).map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    form.status === s
                      ? s === 'Approved' ? 'bg-green-500/10 border-green-500/40 text-green-600'
                      : s === 'Rejected' ? 'bg-destructive/10 border-destructive/40 text-destructive'
                      : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-600'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => onSave(form)}
              className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminBusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [view, setView]             = useState<'table' | 'card'>('table');
  const [viewItem, setViewItem]     = useState<Business | null>(null);
  const [editItem, setEditItem]     = useState<Business | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [userPopup, setUserPopup]   = useState<MockUser | null>(null);

  const CATEGORIES = ['All', ...Array.from(new Set(mockBusinesses.map(b => b.category)))];

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return businesses.filter(biz => {
      const matchCat = activeCategory === 'All' || biz.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const user = getUserById(biz.userId);
      return (
        biz.title.toLowerCase().includes(q) ||
        biz.id.toLowerCase().includes(q) ||
        biz.company.toLowerCase().includes(q) ||
        biz.contact.toLowerCase().includes(q) ||
        biz.email.toLowerCase().includes(q) ||
        biz.cityId.toLowerCase().includes(q) ||
        biz.provinceId.toLowerCase().includes(q) ||
        biz.category.toLowerCase().includes(q) ||
        (biz.status ?? '').toLowerCase().includes(q) ||
        (user ? `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) : false)
      );
    });
  }, [businesses, search, activeCategory]);

  // ── Stat counts ──────────────────────────────────────────────────────────

  const counts = {
    total:    businesses.length,
    approved: businesses.filter(b => b.status === 'Approved').length,
    pending:  businesses.filter(b => b.status === 'Pending').length,
    rejected: businesses.filter(b => b.status === 'Rejected').length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const updateStatus = (id: string, status: ModerationStatus) =>
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));

  const handleDelete = () => {
    if (deleteId) setBusinesses(prev => prev.filter(b => b.id !== deleteId));
    setDeleteId(null);
  };

  const handleEditSave = (updated: Business) => {
    setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditItem(null);
  };

  // ── Reusable action user button ───────────────────────────────────────────

  const UserBtn: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const user = getUserById(userId);
    if (!user) return null;
    return (
      <button
        onClick={() => setUserPopup(user)}
        title={`View user: ${user.firstName} ${user.lastName}`}
        className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
      >
        <User className="w-4 h-4" />
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, company, contact, email, city, category, status, user…"
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No businesses found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term or category</p>
        </div>
      )}

      {/* ── Table View ── */}
      {view === 'table' && filtered.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(biz => (
                  <tr key={biz.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{biz.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {biz.company} · ID: {biz.id}
                        {getUserById(biz.userId) && (
                          <span className="ml-1">· {getUserById(biz.userId)!.firstName} {getUserById(biz.userId)!.lastName}</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <CategoryBadge category={biz.category} />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {biz.cityId}, {biz.provinceId}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {biz.email}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <PlanBadge userId={biz.userId} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={biz.status ?? 'Pending'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button onClick={() => setViewItem(biz)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Approve */}
                        {biz.status !== 'Approved' && (
                          <button onClick={() => updateStatus(biz.id, 'Approved')} title="Approve"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {/* Reject */}
                        {biz.status !== 'Rejected' && (
                          <button onClick={() => updateStatus(biz.id, 'Rejected')} title="Reject"
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {/* Edit */}
                        <button onClick={() => setEditItem(biz)} title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteId(biz.id)} title="Delete"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {/* User */}
                        <UserBtn userId={biz.userId} />
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
          {filtered.map(biz => {
            const owner = getUserById(biz.userId);
            return (
              <div key={biz.id} className="glass-card hover-lift p-5 flex flex-col">
                <div className="w-full h-28 rounded-lg bg-muted mb-4 overflow-hidden flex items-center justify-center">
                  {biz.posterUrl
                    ? <img src={biz.posterUrl} alt={biz.title} className="w-full h-full object-cover" />
                    : <Building2 className="w-8 h-8 text-muted-foreground/40" />
                  }
                </div>

                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">{biz.title}</h3>
                    <span className="text-xs text-muted-foreground">{biz.company} · ID: {biz.id}</span>
                  </div>
                  <CategoryBadge category={biz.category} />
                </div>

                {/* Status + Plan row */}
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={biz.status ?? 'Pending'} />
                  <PlanBadge userId={biz.userId} />
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {biz.addressLine1}, {biz.cityId}, {biz.provinceId}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {biz.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {biz.telephone}
                  </div>
                  {biz.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <a href={biz.website} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline truncate">{biz.website}</a>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => setViewItem(biz)}
                    className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    View
                  </button>
                  <button onClick={() => setEditItem(biz)} title="Edit"
                    className="py-1.5 px-3 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {biz.status !== 'Approved' && (
                    <button onClick={() => updateStatus(biz.id, 'Approved')} title="Approve"
                      className="py-1.5 px-3 rounded-lg border border-border text-green-600 hover:bg-green-500/10 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {biz.status !== 'Rejected' && (
                    <button onClick={() => updateStatus(biz.id, 'Rejected')} title="Reject"
                      className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setDeleteId(biz.id)} title="Delete"
                    className="py-1.5 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {owner && (
                    <button onClick={() => setUserPopup(owner)} title={`View user: ${owner.firstName} ${owner.lastName}`}
                      className="py-1.5 px-3 rounded-lg border border-border text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                      <User className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{viewItem.title}</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewItem.posterUrl && (
              <div className="w-full h-40 rounded-lg bg-muted mb-5 overflow-hidden">
                <img src={viewItem.posterUrl} alt={viewItem.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Submitted By */}
            {getUserById(viewItem.userId) && (() => {
              const owner = getUserById(viewItem.userId)!;
              return (
                <div className="mb-5 p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Submitted By
                  </p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setUserPopup(owner)}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColor(owner.id)} hover:ring-2 hover:ring-ring hover:ring-offset-1 transition-all`}>
                      {getInitials(owner)}
                      {isUserPremium(owner.id) && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{owner.firstName} {owner.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PlanBadge userId={owner.id} />
                      {owner.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => setUserPopup(owner)}
                    className="mt-3 w-full text-xs text-primary hover:underline text-center">
                    View full user profile →
                  </button>
                </div>
              );
            })()}

            <dl className="space-y-3 text-sm">
              {[
                { label: 'ID',      value: viewItem.id },
                { label: 'Company', value: viewItem.company },
                { label: 'Contact', value: viewItem.contact },
                { label: 'Address', value: `${viewItem.addressLine1}, ${viewItem.cityId}, ${viewItem.provinceId} ${viewItem.postcode}` },
                { label: 'Phone',   value: viewItem.telephone },
                { label: 'Mobile',  value: viewItem.mobile },
                { label: 'Fax',     value: viewItem.fax },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex gap-2">
                  <dt className="font-semibold text-foreground w-24 shrink-0">{label}:</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ) : null)}

              <div className="flex gap-2 items-center">
                <dt className="font-semibold text-foreground w-24 shrink-0">Category:</dt>
                <dd><CategoryBadge category={viewItem.category} /></dd>
              </div>
              <div className="flex gap-2 items-center">
                <dt className="font-semibold text-foreground w-24 shrink-0">Plan:</dt>
                <dd><PlanBadge userId={viewItem.userId} /></dd>
              </div>
              <div className="flex gap-2 items-center">
                <dt className="font-semibold text-foreground w-24 shrink-0">Status:</dt>
                <dd><StatusBadge status={viewItem.status ?? 'Pending'} /></dd>
              </div>

              {viewItem.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{viewItem.email}</span>
                </div>
              )}
              {viewItem.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={viewItem.website} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1">
                    {viewItem.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {viewItem.description && (
                <div className="pt-2 border-t border-border">
                  <dt className="font-semibold text-foreground mb-1">Description:</dt>
                  <dd className="text-muted-foreground">{viewItem.description}</dd>
                </div>
              )}
              {viewItem.moreInfo && (
                <div>
                  <dt className="font-semibold text-foreground mb-1">More Info:</dt>
                  <dd className="text-muted-foreground">{viewItem.moreInfo}</dd>
                </div>
              )}
            </dl>

            {/* Social Links */}
            {[viewItem.facebookLink, viewItem.twitterLink, viewItem.linkedinLink, viewItem.instagramLink, viewItem.youtubeLink].some(Boolean) && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Social Links</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Facebook',  url: viewItem.facebookLink },
                    { label: 'Twitter',   url: viewItem.twitterLink },
                    { label: 'LinkedIn',  url: viewItem.linkedinLink },
                    { label: 'Instagram', url: viewItem.instagramLink },
                    { label: 'YouTube',   url: viewItem.youtubeLink },
                  ].filter(s => s.url).map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium text-primary hover:underline transition-colors flex items-center gap-1">
                      {s.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              {viewItem.status !== 'Approved' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'Approved'); setViewItem({ ...viewItem, status: 'Approved' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
              {viewItem.status !== 'Rejected' && (
                <button
                  onClick={() => { updateStatus(viewItem.id, 'Rejected'); setViewItem({ ...viewItem, status: 'Rejected' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <EditBusinessModal
          item={editItem}
          onSave={handleEditSave}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Business"
        message="Are you sure you want to delete this business? This action cannot be undone."
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

export default AdminBusinessManagement;