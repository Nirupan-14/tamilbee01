import React, { useState } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Plus, Pencil, Trash2, Eye, X, Upload, ExternalLink } from 'lucide-react';

const emptyBiz: Omit<Business, 'id'> = {
  title: '', company: '', contact: '', addressLine1: '', cityId: '', provinceId: '',
  postcode: '', telephone: '', mobile: '', fax: '', email: '', website: '',
  description: '', category: '', youtubeLink: '', facebookLink: '', twitterLink: '',
  linkedinLink: '', instagramLink: '', moreInfo: '', htmlContent: '', posterUrl: '',
};

const UserBusiness: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [formOpen, setFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Business | null>(null);
  const [editing, setEditing] = useState<Business | null>(null);
  const [form, setForm] = useState<Omit<Business, 'id'>>(emptyBiz);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setForm(emptyBiz); setEditing(null); setFormOpen(true); };
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

  const mainFields = [
    { key: 'title', label: 'Title' }, { key: 'company', label: 'Company' },
    { key: 'contact', label: 'Contact' }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'addressLine1', label: 'Address Line 1' }, { key: 'cityId', label: 'City' },
    { key: 'provinceId', label: 'Province' }, { key: 'postcode', label: 'Postcode' },
    { key: 'telephone', label: 'Telephone' }, { key: 'mobile', label: 'Mobile' },
    { key: 'fax', label: 'Fax' }, { key: 'website', label: 'Website', type: 'url' },
    { key: 'category', label: 'Category' },
  ];

  const socialFields = [
    { key: 'youtubeLink', label: 'YouTube' }, { key: 'facebookLink', label: 'Facebook' },
    { key: 'twitterLink', label: 'Twitter' }, { key: 'linkedinLink', label: 'LinkedIn' },
    { key: 'instagramLink', label: 'Instagram' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your business listings</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Business
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => (
                <tr key={biz.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{biz.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{biz.company}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{biz.category}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{biz.email}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewItem(biz)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(biz)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(biz.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{viewItem.title}</h2>
              <button onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[{ l: 'Company', v: viewItem.company }, { l: 'Contact', v: viewItem.contact }, { l: 'Email', v: viewItem.email }, { l: 'Phone', v: viewItem.telephone }, { l: 'Category', v: viewItem.category }, { l: 'Address', v: `${viewItem.addressLine1}, ${viewItem.cityId}` }, { l: 'Description', v: viewItem.description }].map(({ l, v }) => v && (
                <div key={l}><span className="font-medium text-foreground">{l}:</span> <span className="text-muted-foreground">{v}</span></div>
              ))}
              {viewItem.website && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">Website:</span>
                  <a href={viewItem.website} className="text-primary hover:underline flex items-center gap-1" target="_blank" rel="noreferrer">{viewItem.website} <ExternalLink className="w-3 h-3" /></a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{editing ? 'Edit Business' : 'Add Business'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mainFields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input type={(f as any).type || 'text'} value={(form as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.label} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialFields.map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                      <input type="url" value={(form as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={`${f.label} URL`} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">More Info</label>
                <textarea value={form.moreInfo} onChange={(e) => update('moreInfo', e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Poster</label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload poster image</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Delete Business" message="Are you sure you want to delete this business listing?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default UserBusiness;
