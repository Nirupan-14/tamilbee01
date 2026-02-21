import React, { useState, useMemo } from 'react';
import { mockEvents } from '@/data/mockData';
import { EventItem } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  CheckCircle, XCircle, Pencil, Trash2, Eye, X,
  List, LayoutGrid, Clock, MapPin, Globe, Phone,
  Link as LinkIcon, Upload, Search, Plus,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ModerationStatus = 'pending' | 'approved' | 'rejected';
type EventLink        = { id: string; label: string; url: string };
type ModeratedEvent   = EventItem & { status: ModerationStatus; extraLinks?: EventLink[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelFor = (list: { id: number; label: string }[], id: number, fallback = '—') =>
  list.find(i => i.id === id)?.label ?? fallback;

const seedEvents = (): ModeratedEvent[] =>
  mockEvents.map((ev, i) => ({
    ...ev,
    extraLinks: [],
    status: (['pending', 'approved', 'rejected', 'pending', 'approved'] as ModerationStatus[])[i % 3],
  }));

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

// ─── Main Component ───────────────────────────────────────────────────────────

const EventModeration: React.FC = () => {
  const [events, setEvents]             = useState<ModeratedEvent[]>(seedEvents());
  const [view, setView]                 = useState<'table' | 'card'>('table');
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [editItem, setEditItem]         = useState<ModeratedEvent | null>(null);
  const [viewItem, setViewItem]         = useState<ModeratedEvent | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState(0); // 0 = All

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter(ev => {
      const matchCat = activeCategory === 0 || ev.CategoryId === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        ev.Event.toLowerCase().includes(q) ||
        String(ev.EventID).includes(q) ||
        new Date(ev.EventDate).toLocaleDateString().includes(q) ||
        ev.Venue.toLowerCase().includes(q) ||
        ev.Contact.toLowerCase().includes(q) ||
        ev.status.toLowerCase().includes(q) ||
        labelFor(CITIES,     ev.CityId).toLowerCase().includes(q) ||
        labelFor(REGIONS,    ev.RegionId).toLowerCase().includes(q) ||
        labelFor(CATEGORIES, ev.CategoryId).toLowerCase().includes(q)
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

  // ── Extra link helpers ────────────────────────────────────────────────────

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
          placeholder="Search by name, ID, date, venue, city, region, category, status…"
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr key={ev.EventID} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{ev.Event}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {ev.EventID} · {labelFor(CITIES, ev.CityId)} · {labelFor(REGIONS, ev.RegionId)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(ev.EventDate).toLocaleDateString()}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">{ev.Venue}</td>
                    <td className="hidden lg:table-cell px-4 py-3"><CategoryBadge categoryId={ev.CategoryId} /></td>
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
          {filtered.map(ev => (
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
              <div className="mb-3"><StatusBadge status={ev.status} /></div>

              <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
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
            </div>
          ))}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
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
      )}

      {/* ── Edit Modal — ALL fields + multiple links ── */}
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

              {/* Event name */}
              <TextInput label="Event Name" value={editItem.Event} onChange={v => set('Event', v)} placeholder="e.g. Tech Conference 2025" />

              {/* Date & Time | Main Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="Date & Time" type="datetime-local" value={editItem.EventDate} onChange={v => set('EventDate', v)} />
                <TextInput label="Main Event Link" value={editItem.Link} onChange={v => set('Link', v)} placeholder="https://example.com" />
              </div>

              {/* Region | City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput label="Region" value={editItem.RegionId} onChange={v => set('RegionId', v)} options={REGIONS} />
                <SelectInput label="City"   value={editItem.CityId}   onChange={v => set('CityId', v)}   options={CITIES} />
              </div>

              {/* Category | Directory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput label="Category"  value={editItem.CategoryId}  onChange={v => set('CategoryId', v)}  options={CATEGORIES} />
                <SelectInput label="Directory" value={editItem.DirectoryId} onChange={v => set('DirectoryId', v)} options={DIRECTORIES} />
              </div>

              {/* Country */}
              <SelectInput label="Country" value={editItem.CountryId} onChange={v => set('CountryId', v)} options={COUNTRIES} />

              {/* Venue | Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="Venue"   value={editItem.Venue}   onChange={v => set('Venue', v)}   placeholder="Convention Center" />
                <TextInput label="Contact" value={editItem.Contact} onChange={v => set('Contact', v)} placeholder="email@example.com" />
              </div>

              {/* ── Additional Links ── */}
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
                    <button type="button" onClick={addLink}
                      className="mt-2 text-xs text-primary hover:underline">+ Add link</button>
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

              {/* Moderation Status — pill toggle */}
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

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default EventModeration;