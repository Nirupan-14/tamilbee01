import React, { useState, useMemo, useRef } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Plus, Pencil, Trash2, Eye, X, Upload, ExternalLink,
  List, LayoutGrid, Search, MapPin, Mail, Phone, Globe, Building2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List as ListIcon, Link as LinkIcon, ImageIcon, Type,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  'All',
  'Technology', 'Marketing', 'Food & Beverage',
  'Health & Fitness', 'Education', 'Fashion & Lifestyle',
];

const DESCRIPTION_LIMIT = 1000;

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

// ─── Required field helper ────────────────────────────────────────────────────

const Req: React.FC = () => <span className="text-destructive ml-0.5">*</span>;

// ─── HTML Rich Text Editor ────────────────────────────────────────────────────

const RichTextEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const toolbars = [
    { icon: <Bold className="w-3.5 h-3.5" />,          cmd: 'bold',          title: 'Bold' },
    { icon: <Italic className="w-3.5 h-3.5" />,         cmd: 'italic',        title: 'Italic' },
    { icon: <Underline className="w-3.5 h-3.5" />,      cmd: 'underline',     title: 'Underline' },
    null,
    { icon: <AlignLeft className="w-3.5 h-3.5" />,      cmd: 'justifyLeft',   title: 'Align Left' },
    { icon: <AlignCenter className="w-3.5 h-3.5" />,    cmd: 'justifyCenter', title: 'Align Center' },
    { icon: <AlignRight className="w-3.5 h-3.5" />,     cmd: 'justifyRight',  title: 'Align Right' },
    null,
    { icon: <ListIcon className="w-3.5 h-3.5" />,       cmd: 'insertUnorderedList', title: 'Bullet List' },
    { icon: <Type className="w-3.5 h-3.5" />,           cmd: 'formatBlock',   title: 'Heading', val: 'h3' },
  ];

  return (
    <div className="border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/40 border-b border-border flex-wrap">
        {toolbars.map((t, i) =>
          t === null ? (
            <div key={i} className="w-px h-4 bg-border mx-1" />
          ) : (
            <button
              key={t.cmd}
              type="button"
              title={t.title}
              onMouseDown={e => { e.preventDefault(); t.cmd === 'createLink' ? insertLink() : exec(t.cmd, t.val); }}
              className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {t.icon}
            </button>
          )
        )}
        <button type="button" title="Insert Link" onMouseDown={e => { e.preventDefault(); insertLink(); }}
          className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || 'Write your content here…'}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[220px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-foreground bg-background outline-none
          [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline"
      />
    </div>
  );
};

// ─── Image Uploader ───────────────────────────────────────────────────────────

const ImageUploader: React.FC<{
  value: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    onChange(URL.createObjectURL(file));
  };

  return (
    <div>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border group">
          <img src={value} alt="Poster" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
              Change Image
            </button>
            <button type="button" onClick={() => onChange('')}
              className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-input bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Click or drag & drop to upload</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
            </div>
          </div>
        </label>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyBiz: Omit<Business, 'id'> = {
  title: '', company: '', contact: '', addressLine1: '', cityId: '', provinceId: '',
  postcode: '', telephone: '', mobile: '', fax: '', email: '', website: '',
  description: '', category: '', youtubeLink: '', facebookLink: '', twitterLink: '',
  linkedinLink: '', instagramLink: '', moreInfo: '', htmlContent: '', posterUrl: '', status: 'Pending',
};

// ─── Field component ──────────────────────────────────────────────────────────

const Field: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const Input: React.FC<{
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}> = ({ value, onChange, type = 'text', placeholder, required }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
  />
);

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
  const openEdit = (b: Business) => { setForm({ ...b }); setEditing(b); setFormOpen(true); };

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

  const upd = (key: keyof Omit<Business, 'id'>, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const descLeft = DESCRIPTION_LIMIT - (form.description?.length ?? 0);

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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, company, contact, email, city, province, status…"
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
                      <div className="text-sm font-medium text-foreground">{biz.company}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {biz.contact && <span>{biz.contact} · </span>}ID: {biz.id}
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
                  ? <img src={biz.posterUrl} alt={biz.company} className="w-full h-full object-cover" />
                  : <Building2 className="w-8 h-8 text-muted-foreground/40" />
                }
              </div>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-foreground leading-tight">{biz.company}</h3>
                  <span className="text-xs text-muted-foreground">{biz.contact && `${biz.contact} · `}ID: {biz.id}</span>
                </div>
                <CategoryBadge category={biz.category} />
              </div>
              <div className="mb-3"><StatusBadge status={biz.status ?? 'Pending'} /></div>
              <div className="space-y-1.5 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {biz.addressLine1}, {biz.cityId}, {biz.provinceId}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />{biz.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />{biz.telephone}
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
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">View</button>
                <button onClick={() => openEdit(biz)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Edit</button>
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
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{viewItem.company}</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewItem.posterUrl && (
              <div className="w-full h-48 rounded-lg bg-muted mb-5 overflow-hidden">
                <img src={viewItem.posterUrl} alt={viewItem.company} className="w-full h-full object-cover" />
              </div>
            )}
            <dl className="space-y-3 text-sm">
              {[
                { label: 'ID',       value: viewItem.id },
                { label: 'Company',  value: viewItem.company },
                { label: 'Contact',  value: viewItem.contact },
                { label: 'Address',  value: `${viewItem.addressLine1}, ${viewItem.cityId}, ${viewItem.provinceId} ${viewItem.postcode}` },
                { label: 'Phone',    value: viewItem.telephone },
                { label: 'Mobile',   value: viewItem.mobile },
                { label: 'Fax',      value: viewItem.fax },
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
                <div className="pt-2 border-t border-border">
                  <dt className="font-semibold text-foreground mb-2">More Info:</dt>
                  <dd className="text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: viewItem.moreInfo }} />
                </div>
              )}
            </dl>
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
          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl p-8 max-h-[92vh] overflow-y-auto animate-fade-in">

            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editing ? 'Edit Business' : 'Add Business'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fields marked <span className="text-destructive font-medium">*</span> are required
                </p>
              </div>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-7">

              {/* ── Section 1: Core info ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Business Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Field label={<>Company <Req /></>}>
                    <Input value={form.company} onChange={v => upd('company', v)} placeholder="e.g. TechCorp Inc." required />
                  </Field>

                  <Field label="Contact Person">
                    <Input value={form.contact} onChange={v => upd('contact', v)} placeholder="Full name" />
                  </Field>

                  <Field label="Email">
                    <Input value={form.email} onChange={v => upd('email', v)} type="email" placeholder="email@example.com" />
                  </Field>

                  <Field label="Website">
                    <Input value={form.website} onChange={v => upd('website', v)} type="url" placeholder="https://example.com" />
                  </Field>

                  <Field label="Telephone">
                    <Input value={form.telephone} onChange={v => upd('telephone', v)} placeholder="+1 555-0000" />
                  </Field>

                  <Field label={<>Mobile <Req /></>}>
                    <Input value={form.mobile} onChange={v => upd('mobile', v)} placeholder="+1 555-0001" required />
                  </Field>

                  <Field label="Fax">
                    <Input value={form.fax} onChange={v => upd('fax', v)} placeholder="+1 555-0002" />
                  </Field>

                </div>
              </section>

              {/* ── Section 2: Location ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Location</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <Field label="Address Line 1">
                      <Input value={form.addressLine1} onChange={v => upd('addressLine1', v)} placeholder="Street address" />
                    </Field>
                  </div>

                  <Field label={<>City <Req /></>}>
                    <Input value={form.cityId} onChange={v => upd('cityId', v)} placeholder="e.g. New York" required />
                  </Field>

                  <Field label={<>Province / State <Req /></>}>
                    <Input value={form.provinceId} onChange={v => upd('provinceId', v)} placeholder="e.g. NY" required />
                  </Field>

                  <Field label="Postcode">
                    <Input value={form.postcode} onChange={v => upd('postcode', v)} placeholder="10001" />
                  </Field>

                </div>
              </section>

              {/* ── Section 3: Category + Image ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Category & Image</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Category */}
                  <Field label={<>Category <Req /></>}>
                    <select value={form.category} onChange={e => upd('category', e.target.value)} required
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select a category</option>
                      {ALL_CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Spacer on sm+ so image uploader sits in right col */}
                  <div className="hidden sm:block" />

                  {/* Image uploader — full width on mobile, right col on sm */}
                  <div className="sm:col-span-2">
                    <Field label="Poster / Cover Image">
                      <ImageUploader value={form.posterUrl} onChange={v => upd('posterUrl', v)} />
                    </Field>
                  </div>

                </div>
              </section>

              {/* ── Section 4: Description ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Description</h3>
                <Field label={<>Description <Req /> <span className="text-muted-foreground font-normal text-xs ml-1">(max {DESCRIPTION_LIMIT} characters)</span></>}>
                  <div className="relative">
                    <textarea
                      value={form.description}
                      onChange={e => {
                        if (e.target.value.length <= DESCRIPTION_LIMIT) upd('description', e.target.value);
                      }}
                      rows={5}
                      required
                      placeholder="Describe your business in detail…"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <span className={`absolute bottom-2.5 right-3 text-xs font-medium ${
                      descLeft < 50 ? 'text-destructive' : descLeft < 150 ? 'text-yellow-600' : 'text-muted-foreground'
                    }`}>
                      {descLeft}/{DESCRIPTION_LIMIT}
                    </span>
                  </div>
                </Field>
              </section>

              {/* ── Section 5: More Info (HTML editor) ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">More Info</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Use the rich text editor below to add formatted content, links, lists, and headings.
                </p>
                <RichTextEditor
                  value={form.moreInfo}
                  onChange={v => upd('moreInfo', v)}
                  placeholder="Add detailed information, hours, special offers, FAQs…"
                />
              </section>

              {/* ── Section 6: Social Links ── */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'facebookLink',  label: 'Facebook' },
                    { key: 'twitterLink',   label: 'Twitter / X' },
                    { key: 'linkedinLink',  label: 'LinkedIn' },
                    { key: 'instagramLink', label: 'Instagram' },
                    { key: 'youtubeLink',   label: 'YouTube' },
                  ].map(s => (
                    <Field key={s.key} label={s.label}>
                      <Input
                        value={(form as any)[s.key] || ''}
                        onChange={v => upd(s.key as keyof Omit<Business, 'id'>, v)}
                        type="url"
                        placeholder={`https://${s.label.toLowerCase().replace(' / x', '').replace(' / ', '')}.com/…`}
                      />
                    </Field>
                  ))}
                </div>
              </section>

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setFormOpen(false)}
                  className="px-5 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-8 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  {editing ? 'Update Business' : 'Create Business'}
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