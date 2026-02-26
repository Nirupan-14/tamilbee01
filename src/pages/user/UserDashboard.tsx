import React, { useState, useRef } from 'react';
import { Calendar, Briefcase, Plus, X, Upload, AlertCircle, Info, Ticket, Image as ImageIcon, Video, Globe, Link as LinkIcon, Tag, ChevronDown } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';

// ─── Shared lookup data ───────────────────────────────────────────────────────

const COUNTRIES = [
  { id: 94, label: 'Sri Lanka' }, { id: 1, label: 'United States' },
  { id: 44, label: 'United Kingdom' }, { id: 91, label: 'India' },
];
const REGIONS = [
  { id: 1, label: 'North Region' }, { id: 2, label: 'South Region' },
  { id: 3, label: 'East Region' },  { id: 4, label: 'West Region' },
];
const CITIES = [
  { id: 1, label: 'New York' }, { id: 2, label: 'Los Angeles' },
  { id: 3, label: 'Chicago' },  { id: 4, label: 'Houston' },
];
const CATEGORIES_EVENT = [
  { id: 1, label: 'General' }, { id: 2, label: 'Tech' },
  { id: 3, label: 'Music' },   { id: 4, label: 'Food' },
  { id: 5, label: 'Art' },     { id: 6, label: 'Business' },
];
const DIRECTORIES = [
  { id: 1, label: 'Directory A' }, { id: 2, label: 'Directory B' },
  { id: 3, label: 'Directory C' },
];
const LINK_TYPES = [
  { value: 'information', label: 'Information',  icon: <Info      className="w-3.5 h-3.5" /> },
  { value: 'tickets',     label: 'Tickets',      icon: <Ticket    className="w-3.5 h-3.5" /> },
  { value: 'event_photos',label: 'Event Photos', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { value: 'promo_video', label: 'Promo Video',  icon: <Video     className="w-3.5 h-3.5" /> },
  { value: 'registration',label: 'Registration', icon: <Tag       className="w-3.5 h-3.5" /> },
  { value: 'website',     label: 'Website',      icon: <Globe     className="w-3.5 h-3.5" /> },
  { value: 'other',       label: 'Other',        icon: <LinkIcon  className="w-3.5 h-3.5" /> },
];
const BIZ_CATEGORIES = [
  'Technology','Marketing','Food & Beverage',
  'Health & Fitness','Education','Fashion & Lifestyle',
];

const getLinkTypeInfo = (type: string) =>
  LINK_TYPES.find(t => t.value === type) ?? LINK_TYPES[LINK_TYPES.length - 1];

// ─── Primitives ───────────────────────────────────────────────────────────────

const Req = () => <span className="text-destructive ml-0.5">*</span>;

const InputField: React.FC<{
  label: React.ReactNode; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
);

const SelectField: React.FC<{
  label: React.ReactNode; value: number | string; onChange: (v: any) => void;
  options: { id: number | string; label: string }[]; placeholder?: string; required?: boolean;
}> = ({ label, value, onChange, options, placeholder = 'Select…', required = false }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} required={required}
      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Add Event Modal ──────────────────────────────────────────────────────────

const emptyEvent = {
  Event: '', EventDate: '', Link: '', Image: '',
  RegionId: 0, CategoryId: 0, DirectoryId: 0,
  Venue: '', Contact: '', CityId: 0, CountryId: 0,
  extraLinks: [] as { id: string; label: string; url: string; type: string }[],
};

const AddEventModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState(emptyEvent);
  const [imagePreview, setImagePreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof typeof form, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    update('Image', file.name);
  };

  const addLink = () =>
    setForm(prev => ({
      ...prev,
      extraLinks: [...prev.extraLinks, { id: Date.now().toString(), label: '', url: '', type: 'information' }],
    }));

  const updateLink = (id: string, field: string, value: string) =>
    setForm(prev => ({
      ...prev,
      extraLinks: prev.extraLinks.map(l => l.id === id ? { ...l, [field]: value } : l),
    }));

  const removeLink = (id: string) =>
    setForm(prev => ({ ...prev, extraLinks: prev.extraLinks.filter(l => l.id !== id) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New event:', form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">Add Event</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Fields marked <span className="text-destructive font-medium">*</span> are required
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField label={<>Title <Req /></>} value={form.Event}
            onChange={v => update('Event', v)} placeholder="e.g. Tech Conference 2025" required />

          <InputField label={<>Date & Time <Req /></>} type="datetime-local"
            value={form.EventDate} onChange={v => update('EventDate', v)} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label={<>Country <Req /></>} value={form.CountryId}
              onChange={v => update('CountryId', Number(v))} options={COUNTRIES} placeholder="Select a country" required />
            <SelectField label={<>Region <Req /></>} value={form.RegionId}
              onChange={v => update('RegionId', Number(v))} options={REGIONS} placeholder="Select a region" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="City" value={form.CityId}
              onChange={v => update('CityId', Number(v))} options={CITIES} placeholder="Select a city" />
            <SelectField label="Directory" value={form.DirectoryId}
              onChange={v => update('DirectoryId', Number(v))} options={DIRECTORIES} placeholder="Select a directory" />
          </div>

          <SelectField label="Category" value={form.CategoryId}
            onChange={v => update('CategoryId', Number(v))} options={CATEGORIES_EVENT} placeholder="Select a category" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Venue" value={form.Venue} onChange={v => update('Venue', v)} placeholder="Convention Center" />
            <InputField label="Contact" value={form.Contact} onChange={v => update('Contact', v)} placeholder="email@example.com" />
          </div>

          <InputField label="Main Event Link" value={form.Link} onChange={v => update('Link', v)} placeholder="https://example.com" />

          {/* Additional Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">
                Additional Links
                {form.extraLinks.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">({form.extraLinks.length})</span>
                )}
              </label>
              <button type="button" onClick={addLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>
            {form.extraLinks.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg py-6 text-center">
                <LinkIcon className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No additional links added</p>
                <button type="button" onClick={addLink} className="mt-2 text-xs text-primary hover:underline">+ Add first link</button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.extraLinks.map((link, idx) => (
                  <div key={link.id} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">{idx + 1}</span>
                      <span className="text-xs font-medium text-muted-foreground">Link {idx + 1}</span>
                      <button type="button" onClick={() => removeLink(link.id)}
                        className="ml-auto p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                      <div className="relative">
                        <select value={link.type} onChange={e => updateLink(link.id, 'type', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                          {LINK_TYPES.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
                        </select>
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                          {getLinkTypeInfo(link.type).icon}
                        </span>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)}
                        placeholder="Label (e.g. Buy Tickets)"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                      <input type="url" value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Poster / Image</label>
            <label className="block border-2 border-dashed border-input rounded-lg p-5 text-center hover:border-primary transition-colors cursor-pointer group">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="h-36 mx-auto rounded-lg object-cover mb-2" />
                  <p className="text-xs text-muted-foreground">{form.Image} · Click to change</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload poster image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10 MB</p>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              New events are submitted with <strong>Pending</strong> status and will be reviewed before going live.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit"
              className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Add Business Modal ───────────────────────────────────────────────────────

const DESCRIPTION_LIMIT = 1000;

const emptyBiz = {
  company: '', contact: '', email: '', website: '', telephone: '',
  mobile: '', fax: '', addressLine1: '', cityId: '', provinceId: '',
  postcode: '', category: '', description: '', posterUrl: '',
  facebookLink: '', twitterLink: '', linkedinLink: '', instagramLink: '', youtubeLink: '',
};

const AddBusinessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState(emptyBiz);
  const inputRef = useRef<HTMLInputElement>(null);

  const upd = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upd('posterUrl', URL.createObjectURL(file));
  };

  const descLeft = DESCRIPTION_LIMIT - (form.description?.length ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New business:', form);
    onClose();
  };

  const Field: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );

  const Input: React.FC<{ value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }> =
    ({ value, onChange, type = 'text', placeholder, required }) => (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl p-8 max-h-[92vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Business</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fields marked <span className="text-destructive font-medium">*</span> are required
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Business Info */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={<>Company <Req /></>}><Input value={form.company} onChange={v => upd('company', v)} placeholder="TechCorp Inc." required /></Field>
              <Field label="Contact Person"><Input value={form.contact} onChange={v => upd('contact', v)} placeholder="Full name" /></Field>
              <Field label="Email"><Input value={form.email} onChange={v => upd('email', v)} type="email" placeholder="email@example.com" /></Field>
              <Field label="Website"><Input value={form.website} onChange={v => upd('website', v)} type="url" placeholder="https://example.com" /></Field>
              <Field label="Telephone"><Input value={form.telephone} onChange={v => upd('telephone', v)} placeholder="+1 555-0000" /></Field>
              <Field label={<>Mobile <Req /></>}><Input value={form.mobile} onChange={v => upd('mobile', v)} placeholder="+1 555-0001" required /></Field>
              <Field label="Fax"><Input value={form.fax} onChange={v => upd('fax', v)} placeholder="+1 555-0002" /></Field>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address Line 1"><Input value={form.addressLine1} onChange={v => upd('addressLine1', v)} placeholder="Street address" /></Field>
              </div>
              <Field label={<>City <Req /></>}><Input value={form.cityId} onChange={v => upd('cityId', v)} placeholder="e.g. New York" required /></Field>
              <Field label={<>Province / State <Req /></>}><Input value={form.provinceId} onChange={v => upd('provinceId', v)} placeholder="e.g. NY" required /></Field>
              <Field label="Postcode"><Input value={form.postcode} onChange={v => upd('postcode', v)} placeholder="10001" /></Field>
            </div>
          </section>

          {/* Category & Image */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Category & Image</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label={<>Category <Req /></>}>
                <select value={form.category} onChange={e => upd('category', e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select a category</option>
                  {BIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Poster / Cover Image">
                  {form.posterUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-border group">
                      <img src={form.posterUrl} alt="Poster" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button type="button" onClick={() => inputRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">Change Image</button>
                        <button type="button" onClick={() => upd('posterUrl', '')}
                          className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-input bg-muted/20 hover:bg-muted/40 hover:border-primary transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-2">
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click or drag & drop to upload</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
                      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                  )}
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </Field>
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Description</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <Req /> <span className="text-muted-foreground font-normal text-xs ml-1">(max {DESCRIPTION_LIMIT} characters)</span>
              </label>
              <div className="relative">
                <textarea value={form.description}
                  onChange={e => { if (e.target.value.length <= DESCRIPTION_LIMIT) upd('description', e.target.value); }}
                  rows={5} required placeholder="Describe your business in detail…"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                <span className={`absolute bottom-2.5 right-3 text-xs font-medium ${
                  descLeft < 50 ? 'text-destructive' : descLeft < 150 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {descLeft}/{DESCRIPTION_LIMIT}
                </span>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'facebookLink', label: 'Facebook' },
                { key: 'twitterLink',  label: 'Twitter / X' },
                { key: 'linkedinLink', label: 'LinkedIn' },
                { key: 'instagramLink',label: 'Instagram' },
                { key: 'youtubeLink',  label: 'YouTube' },
              ].map(s => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{s.label}</label>
                  <input type="url" value={(form as any)[s.key]}
                    onChange={e => upd(s.key as keyof typeof form, e.target.value)}
                    placeholder={`https://${s.label.toLowerCase().replace(' / x','').replace(' ','')}.com/…`}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit"
              className="px-8 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Business</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const UserDashboard: React.FC = () => {
  const [showAddEvent, setShowAddEvent]       = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);

  const stats = [
    {
      title: 'Total Events',
      value: 12,
      icon: Calendar,
      change: '+3 this month',
      changeType: 'positive' as const,
      onAction: () => setShowAddEvent(true),
    },
    {
      title: 'Active Businesses',
      value: 4,
      icon: Briefcase,
      change: '+1 this month',
      changeType: 'positive' as const,
      onAction: () => setShowAddBusiness(true),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's an overview of your activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="relative group">
            <StatCard {...stat} />
            {/* Floating "+" button on each card */}
            <button
              onClick={stat.onAction}
              title={`Add ${stat.title.replace('Total ', '').replace('Active ', '')}`}
              className="absolute top-3 right-3 w-7 h-7 rounded-full gradient-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      
      

      {showAddEvent    && <AddEventModal    onClose={() => setShowAddEvent(false)} />}
      {showAddBusiness && <AddBusinessModal onClose={() => setShowAddBusiness(false)} />}
    </div>
  );
};

export default UserDashboard;