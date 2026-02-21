import React, { useState, useMemo } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Plus, Pencil, Trash2, LayoutGrid, List, X,
  Upload, MapPin, Clock, Eye, Link as LinkIcon,
  Phone, Globe, Search, CheckCircle, XCircle, AlertCircle,
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface EventItem {
  EventID: number;
  Event: string;
  EventDate: string;
  Link: string;
  Image: string;
  RegionId: number;
  CategoryId: number;
  DirectoryId: number;
  Venue: string;
  Contact: string;
  CityId: number;
  CountryId: number;
  DefaultImg: string;
  status: EventStatus; // ← NEW
}

type EventLink = { id: string; label: string; url: string };
type RichEvent = EventItem & { extraLinks?: EventLink[] };

// ─── Mock Data (inline) ───────────────────────────────────────────────────────

const mockEvents: EventItem[] = [
  { EventID: 1, Event: 'Tech Conference 2025', EventDate: '2025-03-15T09:00:00', Link: 'https://techconf.com', Image: '', RegionId: 1, CategoryId: 2, DirectoryId: 1, Venue: 'Convention Center', Contact: 'tech@example.com', CityId: 1, CountryId: 94, DefaultImg: 'default.jpg', status: 'approved' },
  { EventID: 2, Event: 'Music Festival', EventDate: '2025-04-20T14:00:00', Link: 'https://musicfest.com', Image: '', RegionId: 2, CategoryId: 3, DirectoryId: 2, Venue: 'Sunset Park', Contact: 'music@example.com', CityId: 2, CountryId: 94, DefaultImg: 'default.jpg', status: 'pending' },
  { EventID: 3, Event: 'Food & Wine Expo', EventDate: '2025-05-10T11:00:00', Link: 'https://foodexpo.com', Image: '', RegionId: 3, CategoryId: 4, DirectoryId: 3, Venue: 'McCormick Place', Contact: 'food@example.com', CityId: 3, CountryId: 94, DefaultImg: 'default.jpg', status: 'approved' },
  { EventID: 4, Event: 'Art Gallery Opening', EventDate: '2025-06-01T18:00:00', Link: 'https://artgallery.com', Image: '', RegionId: 4, CategoryId: 5, DirectoryId: 4, Venue: 'Modern Art Museum', Contact: 'art@example.com', CityId: 4, CountryId: 94, DefaultImg: 'default.jpg', status: 'rejected' },
  { EventID: 5, Event: 'Startup Pitch Night', EventDate: '2025-07-08T19:00:00', Link: 'https://startuppitch.com', Image: '', RegionId: 2, CategoryId: 6, DirectoryId: 5, Venue: 'Innovation Hub', Contact: 'startup@example.com', CityId: 5, CountryId: 94, DefaultImg: 'default.jpg', status: 'pending' },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seedEvents = (): RichEvent[] =>
  mockEvents.map(ev => ({ ...ev, extraLinks: [] }));

// ─── Empty form state ──────────────────────────────────────────────────────────

const emptyEvent: Omit<RichEvent, 'EventID'> = {
  Event: '', EventDate: '', Link: '', Image: '',
  RegionId: 0, CategoryId: 0, DirectoryId: 0,
  Venue: '', Contact: '', CityId: 0, CountryId: 0,
  DefaultImg: '', extraLinks: [],
  status: 'pending', // new events start as pending
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const labelFor = (list: { id: number; label: string }[], id: number, fallback = '—') =>
  list.find(i => i.id === id)?.label ?? fallback;

// ─── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: EventStatus }> = ({ status }) => {
  const config: Record<EventStatus, { label: string; style: string; icon: React.ReactNode }> = {
    pending:  {
      label: 'Pending',
      style: 'bg-amber-500/10 text-amber-600 border-amber-200',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    approved: {
      label: 'Approved',
      style: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    rejected: {
      label: 'Rejected',
      style: 'bg-red-500/10 text-red-500 border-red-200',
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const { label, style, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {icon}
      {label}
    </span>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const InputField: React.FC<{
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      required={required} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

const SelectField: React.FC<{
  label: string; value: number; onChange: (v: number) => void;
  options: { id: number; label: string }[]; placeholder?: string;
}> = ({ label, value, onChange, options, placeholder = 'Select…' }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <select
      value={value} onChange={e => onChange(Number(e.target.value))} required
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value={0} disabled>{placeholder}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

const CategoryBadge: React.FC<{ categoryId: number }> = ({ categoryId }) => {
  const styles: Record<number, { label: string; style: string }> = {
    1: { label: 'General',  style: 'bg-muted text-muted-foreground' },
    2: { label: 'Tech',     style: 'bg-blue-500/10 text-blue-500' },
    3: { label: 'Music',    style: 'bg-purple-500/10 text-purple-500' },
    4: { label: 'Food',     style: 'bg-orange-500/10 text-orange-500' },
    5: { label: 'Art',      style: 'bg-pink-500/10 text-pink-500' },
    6: { label: 'Business', style: 'bg-green-500/10 text-green-600' },
  };
  const cat = styles[categoryId] ?? { label: `Cat ${categoryId}`, style: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.style}`}>
      {cat.label}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const UserEvents: React.FC = () => {
  const [events, setEvents]             = useState<RichEvent[]>(seedEvents());
  const [view, setView]                 = useState<'table' | 'card'>('table');
  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState<RichEvent | null>(null);
  const [viewItem, setViewItem]         = useState<RichEvent | null>(null);
  const [form, setForm]                 = useState<Omit<RichEvent, 'EventID'>>(emptyEvent);
  const [deleteId, setDeleteId]         = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter(ev => {
      const matchCat    = activeCategory === 0 || ev.CategoryId === activeCategory;
      const matchStatus = statusFilter === 'all' || ev.status === statusFilter;
      if (!matchCat || !matchStatus) return false;
      if (!q) return true;
      return (
        ev.Event.toLowerCase().includes(q) ||
        String(ev.EventID).includes(q) ||
        new Date(ev.EventDate).toLocaleDateString().includes(q) ||
        ev.Venue.toLowerCase().includes(q) ||
        ev.Contact.toLowerCase().includes(q) ||
        ev.status.toLowerCase().includes(q) ||
        labelFor(CITIES,      ev.CityId).toLowerCase().includes(q) ||
        labelFor(REGIONS,     ev.RegionId).toLowerCase().includes(q) ||
        labelFor(CATEGORIES,  ev.CategoryId).toLowerCase().includes(q)
      );
    });
  }, [events, search, activeCategory, statusFilter]);

  // ── Status counts ──────────────────────────────────────────────────────────

  const statusCounts = useMemo(() => ({
    all:      events.length,
    pending:  events.filter(e => e.status === 'pending').length,
    approved: events.filter(e => e.status === 'approved').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  }), [events]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyEvent); setEditing(null); setImagePreview(''); setFormOpen(true);
  };

  const openEdit = (ev: RichEvent) => {
    setForm({ ...ev }); setEditing(ev); setImagePreview(ev.Image || ''); setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setEvents(prev => prev.map(ev => ev.EventID === editing.EventID ? { ...ev, ...form } : ev));
    } else {
      setEvents(prev => [...prev, { ...form, EventID: Date.now(), status: 'pending' } as RichEvent]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId !== null) setEvents(prev => prev.filter(ev => ev.EventID !== deleteId));
    setDeleteId(null);
  };

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    update('Image', file.name);
  };

  // ── Extra link helpers ────────────────────────────────────────────────────

  const addLink = () =>
    setForm(prev => ({
      ...prev,
      extraLinks: [...(prev.extraLinks || []), { id: Date.now().toString(), label: '', url: '' }],
    }));

  const updateLink = (id: string, field: 'label' | 'url', value: string) =>
    setForm(prev => ({
      ...prev,
      extraLinks: (prev.extraLinks || []).map(l => l.id === id ? { ...l, [field]: value } : l),
    }));

  const removeLink = (id: string) =>
    setForm(prev => ({
      ...prev,
      extraLinks: (prev.extraLinks || []).filter(l => l.id !== id),
    }));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* ── Status summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { key: 'all',      label: 'All Events', color: 'text-foreground',     bg: 'bg-muted/40' },
            { key: 'pending',  label: 'Pending',    color: 'text-amber-600',      bg: 'bg-amber-500/10' },
            { key: 'approved', label: 'Approved',   color: 'text-emerald-600',    bg: 'bg-emerald-500/10' },
            { key: 'rejected', label: 'Rejected',   color: 'text-red-500',        bg: 'bg-red-500/10' },
          ] as const
        ).map(({ key, label, color, bg }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`glass-card p-4 text-left transition-all hover-lift ${statusFilter === key ? 'ring-2 ring-ring' : ''}`}
          >
            <p className={`text-2xl font-bold ${color}`}>{statusCounts[key]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <div className={`mt-2 h-1 rounded-full ${bg}`} />
          </button>
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
                  {['Name', 'Date', 'Venue', 'Region', 'City', 'Category', 'Status', 'Actions'].map(h => (
                    <th key={h}
                      className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider
                        ${['Region', 'City'].includes(h) ? 'hidden lg:table-cell' : ''}
                        ${h === 'Venue' ? 'hidden md:table-cell' : ''}
                        ${h === 'Actions' ? 'text-right' : ''}`}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(ev => (
                  <tr key={ev.EventID} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{ev.Event}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">ID: {ev.EventID}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(ev.EventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{ev.Venue}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{labelFor(REGIONS, ev.RegionId)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{labelFor(CITIES, ev.CityId)}</td>
                    <td className="px-4 py-3"><CategoryBadge categoryId={ev.CategoryId} /></td>
                    {/* ── Status column ── */}
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(ev)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
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

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground leading-tight">{ev.Event}</h3>
                  <span className="text-xs text-muted-foreground">ID: {ev.EventID}</span>
                </div>
                <CategoryBadge categoryId={ev.CategoryId} />
              </div>

              {/* ── Status badge in card ── */}
              <div className="mb-3">
                <StatusBadge status={ev.status} />
              </div>

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
                      className="text-primary hover:underline truncate text-xs">
                      {l.label || l.url}
                    </a>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{viewItem.Event}</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status banner in view modal */}
            <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <StatusBadge status={viewItem.status} />
              {viewItem.status === 'pending' && (
                <span className="ml-auto text-xs text-muted-foreground">Awaiting review</span>
              )}
              {viewItem.status === 'approved' && (
                <span className="ml-auto text-xs text-emerald-600">Your event is live</span>
              )}
              {viewItem.status === 'rejected' && (
                <span className="ml-auto text-xs text-red-500">Contact support for details</span>
              )}
            </div>

            {viewItem.Image && (
              <div className="w-full h-40 rounded-lg bg-muted mb-4 overflow-hidden">
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
                { label: 'Country ID',  value: String(viewItem.CountryId) },
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
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? 'Edit Event' : 'Add Event'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              <InputField label="Event Name" value={form.Event}
                onChange={v => update('Event', v)} placeholder="e.g. Tech Conference 2025" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Date & Time" type="datetime-local" value={form.EventDate} onChange={v => update('EventDate', v)} />
                <InputField label="Main Event Link" value={form.Link} onChange={v => update('Link', v)} placeholder="https://example.com" required={false} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Region" value={form.RegionId} onChange={v => update('RegionId', v)} options={REGIONS} placeholder="Select a region" />
                <SelectField label="City"   value={form.CityId}   onChange={v => update('CityId', v)}   options={CITIES}   placeholder="Select a city" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Category"  value={form.CategoryId}  onChange={v => update('CategoryId', v)}  options={CATEGORIES}  placeholder="Select a category" />
                <SelectField label="Directory" value={form.DirectoryId} onChange={v => update('DirectoryId', v)} options={DIRECTORIES} placeholder="Select a directory" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Venue"   value={form.Venue}   onChange={v => update('Venue', v)}   placeholder="Convention Center" />
                <InputField label="Contact" value={form.Contact} onChange={v => update('Contact', v)} placeholder="email@example.com" />
              </div>

              <InputField label="Country ID" type="number" value={form.CountryId}
                onChange={v => update('CountryId', Number(v))} placeholder="e.g. 94" />

              {/* ── Additional Links ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">
                    Additional Links
                    {(form.extraLinks || []).length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">({(form.extraLinks || []).length})</span>
                    )}
                  </label>
                  <button type="button" onClick={addLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>

                {(form.extraLinks || []).length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg py-6 text-center">
                    <LinkIcon className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No additional links added</p>
                    <button type="button" onClick={addLink}
                      className="mt-2 text-xs text-primary hover:underline">+ Add first link</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(form.extraLinks || []).map((link, idx) => (
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

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Poster / Image</label>
                <label className="block border-2 border-dashed border-input rounded-lg p-5 text-center hover:border-primary transition-colors cursor-pointer">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover" />
                      <p className="text-xs text-muted-foreground mt-2">{form.Image} · Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload poster image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10 MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Status note for new events */}
              {!editing && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    New events are submitted with <strong>Pending</strong> status and will be reviewed before going live.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  {editing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
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

export default UserEvents;