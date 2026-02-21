import React, { useState, useMemo } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Plus, Pencil, Trash2, Eye, X, Upload, ExternalLink,
  List, LayoutGrid, Search, MapPin, Mail, Phone, Globe, Building2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ['All', ...Array.from(new Set(mockBusinesses.map(b => b.category)))];

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-500/10 text-green-600',
    Pending:  'bg-yellow-500/10 text-yellow-600',
    Rejected: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
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

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyBiz: Omit<Business, 'id'> = {
  title: '', company: '', contact: '', addressLine1: '', cityId: '', provinceId: '',
  postcode: '', telephone: '', mobile: '', fax: '', email: '', website: '',
  description: '', category: '', youtubeLink: '', facebookLink: '', twitterLink: '',
  linkedinLink: '', instagramLink: '', moreInfo: '', htmlContent: '', posterUrl: '', status: 'Pending',
};

const mainFields = [
  { key: 'title',       label: 'Title' },
  { key: 'company',     label: 'Company' },
  { key: 'contact',     label: 'Contact' },
  { key: 'email',       label: 'Email',    type: 'email' },
  { key: 'addressLine1',label: 'Address Line 1' },
  { key: 'cityId',      label: 'City' },
  { key: 'provinceId',  label: 'Province' },
  { key: 'postcode',    label: 'Postcode' },
  { key: 'telephone',   label: 'Telephone' },
  { key: 'mobile',      label: 'Mobile' },
  { key: 'fax',         label: 'Fax' },
  { key: 'website',     label: 'Website',  type: 'url' },
  { key: 'category',    label: 'Category' },
];

const socialFields = [
  { key: 'youtubeLink',  label: 'YouTube' },
  { key: 'facebookLink', label: 'Facebook' },
  { key: 'twitterLink',  label: 'Twitter' },
  { key: 'linkedinLink', label: 'LinkedIn' },
  { key: 'instagramLink',label: 'Instagram' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const UserBusiness: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [view, setView]             = useState<'table' | 'card'>('table');
  const [formOpen, setFormOpen]     = useState(false);
  const [viewItem, setViewItem]     = useState<Business | null>(null);
  const [editing, setEditing]       = useState<Business | null>(null);
  const [form, setForm]             = useState<Omit<Business, 'id'>>(emptyBiz);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return businesses.filter(biz => {
      const matchCat = activeCategory === 'All' || biz.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        biz.title.toLowerCase().includes(q) ||
        biz.id.toLowerCase().includes(q) ||
        biz.company.toLowerCase().includes(q) ||
        biz.contact.toLowerCase().includes(q) ||
        biz.email.toLowerCase().includes(q) ||
        biz.cityId.toLowerCase().includes(q) ||
        biz.provinceId.toLowerCase().includes(q) ||
        biz.category.toLowerCase().includes(q) ||
        (biz.status ?? '').toLowerCase().includes(q)
      );
    });
  }, [businesses, search, activeCategory]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const openAdd  = () => { setForm(emptyBiz); setEditing(null); setFormOpen(true); };
  const openEdit = (b: Business) => { setForm(b); setEditing(b); setFormOpen(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setBusinesses(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
    } else {
      setBusinesses(prev => [...prev, { ...form, id: Date.now().toString() } as Business]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) setBusinesses(prev => prev.filter(b => b.id !== deleteId));
    setDeleteId(null);
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {businesses.length} listing{businesses.length !== 1 ? 's' : ''}
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
            <Plus className="w-4 h-4" /> Add Business
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, company, contact, email, city, province, status…"
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
        {ALL_CATEGORIES.map(cat => (
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
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
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
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <CategoryBadge category={biz.category} />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {biz.cityId}, {biz.provinceId}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {biz.email}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={biz.status ?? 'Pending'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(biz)} title="View"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(biz)} title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(biz.id)} title="Delete"
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
          {filtered.map(biz => (
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

              <div className="mb-3">
                <StatusBadge status={biz.status ?? 'Pending'} />
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

              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setViewItem(biz)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  View
                </button>
                <button onClick={() => openEdit(biz)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteId(biz.id)}
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
                <dt className="font-semibold text-foreground w-24 shrink-0">Status:</dt>
                <dd><StatusBadge status={viewItem.status ?? 'Pending'} /></dd>
              </div>

              {viewItem.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{viewItem.email}</span>
                </div>
              )}

              {viewItem.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
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

            {/* Social links */}
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
                {editing ? 'Edit Business' : 'Add Business'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* Main fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mainFields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input
                      type={(f as any).type || 'text'}
                      value={(form as any)[f.key]}
                      onChange={e => update(f.key, e.target.value)}
                      placeholder={f.label}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={3} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              {/* Social links */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialFields.map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                      <input type="url" value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                        placeholder={`${f.label} URL`}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* More info */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">More Info</label>
                <textarea value={form.moreInfo} onChange={e => update('moreInfo', e.target.value)}
                  rows={2} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              {/* Poster */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Poster</label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload poster image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10 MB</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Business"
        message="Are you sure you want to delete this business listing? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default UserBusiness;