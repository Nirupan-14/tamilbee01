import React, { useState, useMemo } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Eye, Trash2, X, Mail, Phone, Globe, MapPin,
  List, LayoutGrid, Search, CheckCircle, XCircle,
  ExternalLink, Building2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ModerationStatus = 'Approved' | 'Pending' | 'Rejected';

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
    'Technology':       'bg-blue-500/10 text-blue-500',
    'Marketing':        'bg-purple-500/10 text-purple-500',
    'Food & Beverage':  'bg-orange-500/10 text-orange-500',
    'Health & Fitness': 'bg-green-500/10 text-green-600',
    'Education':        'bg-pink-500/10 text-pink-500',
    'Fashion & Lifestyle': 'bg-rose-500/10 text-rose-500',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[category] ?? 'bg-muted text-muted-foreground'}`}>
      {category}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminBusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [view, setView]             = useState<'table' | 'card'>('table');
  const [viewItem, setViewItem]     = useState<Business | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ['All', ...Array.from(new Set(mockBusinesses.map(b => b.category)))];

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
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, company, contact, email, city, province, category, status…"
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
                    <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
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
                        {biz.status !== 'Approved' && (
                          <button onClick={() => updateStatus(biz.id, 'Approved')} title="Approve"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {biz.status !== 'Rejected' && (
                          <button onClick={() => updateStatus(biz.id, 'Rejected')} title="Reject"
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
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
                    { label: 'Facebook', url: viewItem.facebookLink },
                    { label: 'Twitter', url: viewItem.twitterLink },
                    { label: 'LinkedIn', url: viewItem.linkedinLink },
                    { label: 'Instagram', url: viewItem.instagramLink },
                    { label: 'YouTube', url: viewItem.youtubeLink },
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

      <ConfirmModal
        open={!!deleteId}
        title="Delete Business"
        message="Are you sure you want to delete this business? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminBusinessManagement;