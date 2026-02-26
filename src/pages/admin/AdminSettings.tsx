import React, { useState, useMemo } from 'react';
import {
  Globe, Map, MapPin, Plus, Pencil, Trash2, Eye, X, Search,
  ChevronRight, Building2, Check, Settings,
} from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
}

interface Region {
  id: number;
  name: string;
  countryId: number;
}

interface City {
  id: number;
  name: string;
  regionId: number;
}

type Tab = 'countries' | 'regions' | 'cities';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedCountries: Country[] = [
  { id: 1, name: 'Sri Lanka',      code: 'LK', flag: '🇱🇰' },
  { id: 2, name: 'United States',  code: 'US', flag: '🇺🇸' },
  { id: 3, name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { id: 4, name: 'India',          code: 'IN', flag: '🇮🇳' },
  { id: 5, name: 'Australia',      code: 'AU', flag: '🇦🇺' },
];

const seedRegions: Region[] = [
  { id: 1,  name: 'Western Province',  countryId: 1 },
  { id: 2,  name: 'Central Province',  countryId: 1 },
  { id: 3,  name: 'Southern Province', countryId: 1 },
  { id: 4,  name: 'California',        countryId: 2 },
  { id: 5,  name: 'New York State',    countryId: 2 },
  { id: 6,  name: 'Texas',             countryId: 2 },
  { id: 7,  name: 'England',           countryId: 3 },
  { id: 8,  name: 'Scotland',          countryId: 3 },
  { id: 9,  name: 'Maharashtra',       countryId: 4 },
  { id: 10, name: 'Karnataka',         countryId: 4 },
  { id: 11, name: 'New South Wales',   countryId: 5 },
  { id: 12, name: 'Victoria',          countryId: 5 },
];

const seedCities: City[] = [
  { id: 1,  name: 'Colombo',       regionId: 1  },
  { id: 2,  name: 'Negombo',       regionId: 1  },
  { id: 3,  name: 'Kandy',         regionId: 2  },
  { id: 4,  name: 'Nuwara Eliya',  regionId: 2  },
  { id: 5,  name: 'Galle',         regionId: 3  },
  { id: 6,  name: 'Los Angeles',   regionId: 4  },
  { id: 7,  name: 'San Francisco', regionId: 4  },
  { id: 8,  name: 'New York City', regionId: 5  },
  { id: 9,  name: 'Buffalo',       regionId: 5  },
  { id: 10, name: 'Houston',       regionId: 6  },
  { id: 11, name: 'Dallas',        regionId: 6  },
  { id: 12, name: 'London',        regionId: 7  },
  { id: 13, name: 'Manchester',    regionId: 7  },
  { id: 14, name: 'Edinburgh',     regionId: 8  },
  { id: 15, name: 'Mumbai',        regionId: 9  },
  { id: 16, name: 'Pune',          regionId: 9  },
  { id: 17, name: 'Bangalore',     regionId: 10 },
  { id: 18, name: 'Sydney',        regionId: 11 },
  { id: 19, name: 'Melbourne',     regionId: 12 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nextId = (list: { id: number }[]) =>
  list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;

// ─── Shared Primitives ────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const TInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ value, onChange, placeholder, required }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm
      focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
  />
);

// ─── View Modal ───────────────────────────────────────────────────────────────

const ViewModal: React.FC<{
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  onClose: () => void;
}> = ({ title, rows, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <dl className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex gap-3 items-start">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 shrink-0 pt-0.5">
              {r.label}
            </dt>
            <dd className="text-sm text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Close
      </button>
    </div>
  </div>
);

// ─── Form Modal ───────────────────────────────────────────────────────────────

const FormModal: React.FC<{
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel?: string;
}> = ({ title, onClose, onSubmit, children, submitLabel = 'Save' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ─── COUNTRIES TAB ────────────────────────────────────────────────────────────

const CountriesTab: React.FC<{
  countries: Country[];
  setCountries: React.Dispatch<React.SetStateAction<Country[]>>;
  regionCount: (countryId: number) => number;
}> = ({ countries, setCountries, regionCount }) => {
  const [search,   setSearch]   = useState('');
  const [viewItem, setViewItem] = useState<Country | null>(null);
  const [editItem, setEditItem] = useState<Country | null>(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', code: '', flag: '' });

  const filtered = useMemo(() =>
    countries.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    ), [countries, search]);

  const openAdd  = () => { setForm({ name: '', code: '', flag: '' }); setAddOpen(true); };
  const openEdit = (c: Country) => { setForm({ name: c.name, code: c.code, flag: c.flag }); setEditItem(c); };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setCountries(prev => [...prev, { id: nextId(prev), ...form }]);
    setAddOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setCountries(prev => prev.map(c => c.id === editItem.id ? { ...c, ...form } : c));
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId !== null) setCountries(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search countries…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm
              focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Country
        </button>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
        <span className="font-medium text-foreground">{countries.length}</span> countries
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regions</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No countries found
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-muted text-foreground border border-border">
                      {c.code}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Map className="w-3.5 h-3.5" />
                      {regionCount(c.id)} region{regionCount(c.id) !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewItem(c)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(c)}    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
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
        <ViewModal
          title={`${viewItem.flag} ${viewItem.name}`}
          onClose={() => setViewItem(null)}
          rows={[
            { label: 'ID',      value: viewItem.id },
            { label: 'Name',    value: viewItem.name },
            { label: 'Code',    value: <span className="font-mono font-semibold">{viewItem.code}</span> },
            { label: 'Flag',    value: <span className="text-2xl">{viewItem.flag}</span> },
            { label: 'Regions', value: `${regionCount(viewItem.id)} region(s)` },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      {(addOpen || editItem) && (
        <FormModal
          title={editItem ? 'Edit Country' : 'Add Country'}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSubmit={editItem ? handleEdit : handleAdd}
          submitLabel={editItem ? 'Update Country' : 'Add Country'}
        >
          <Field label="Country Name *">
            <TInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Sri Lanka" required />
          </Field>
          <Field label="Country Code *">
            <TInput
              value={form.code}
              onChange={v => setForm(p => ({ ...p, code: v.toUpperCase().slice(0, 3) }))}
              placeholder="e.g. LK"
              required
            />
          </Field>
          <Field label="Flag Emoji">
            <TInput value={form.flag} onChange={v => setForm(p => ({ ...p, flag: v }))} placeholder="e.g. 🇱🇰" />
          </Field>
        </FormModal>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Country"
        message="Deleting this country will also affect its regions and cities. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ─── REGIONS TAB ─────────────────────────────────────────────────────────────

const RegionsTab: React.FC<{
  regions: Region[];
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>;
  countries: Country[];
  cityCount: (regionId: number) => number;
}> = ({ regions, setRegions, countries, cityCount }) => {
  const [search,        setSearch]        = useState('');
  const [countryFilter, setCountryFilter] = useState(0);
  const [viewItem,      setViewItem]      = useState<Region | null>(null);
  const [editItem,      setEditItem]      = useState<Region | null>(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [deleteId,      setDeleteId]      = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', countryId: 0 });

  const filtered = useMemo(() =>
    regions.filter(r => {
      const matchCountry = countryFilter === 0 || r.countryId === countryFilter;
      const matchSearch  = r.name.toLowerCase().includes(search.toLowerCase());
      return matchCountry && matchSearch;
    }), [regions, search, countryFilter]);

  const countryOf = (id: number) => countries.find(c => c.id === id);

  const openAdd  = () => { setForm({ name: '', countryId: 0 }); setAddOpen(true); };
  const openEdit = (r: Region) => { setForm({ name: r.name, countryId: r.countryId }); setEditItem(r); };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.countryId) return;
    setRegions(prev => [...prev, { id: nextId(prev), name: form.name, countryId: form.countryId }]);
    setAddOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setRegions(prev => prev.map(r => r.id === editItem.id ? { ...r, ...form } : r));
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId !== null) setRegions(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search regions…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm
              focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(Number(e.target.value))}
          className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[160px]"
        >
          <option value={0}>All Countries</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
        </select>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Region
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
        <span className="font-medium text-foreground">{regions.length}</span> regions
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cities</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No regions found</td>
                </tr>
              ) : filtered.map(r => {
                const country = countryOf(r.countryId);
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {r.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      {country && (
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-sm text-muted-foreground">{country.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {cityCount(r.id)} cit{cityCount(r.id) !== 1 ? 'ies' : 'y'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(r)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(r)}    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (() => {
        const country = countryOf(viewItem.countryId);
        return (
          <ViewModal
            title={viewItem.name}
            onClose={() => setViewItem(null)}
            rows={[
              { label: 'ID',      value: viewItem.id },
              { label: 'Name',    value: viewItem.name },
              { label: 'Country', value: country ? `${country.flag} ${country.name}` : '—' },
              { label: 'Cities',  value: `${cityCount(viewItem.id)} city/cities` },
            ]}
          />
        );
      })()}

      {/* Add / Edit Modal */}
      {(addOpen || editItem) && (
        <FormModal
          title={editItem ? 'Edit Region' : 'Add Region'}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSubmit={editItem ? handleEdit : handleAdd}
          submitLabel={editItem ? 'Update Region' : 'Add Region'}
        >
          <Field label="Region Name *">
            <TInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Western Province" required />
          </Field>
          <Field label="Country *">
            <select
              value={form.countryId}
              onChange={e => setForm(p => ({ ...p, countryId: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0} disabled>Select a country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
        </FormModal>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Region"
        message="Deleting this region will also affect its cities. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ─── CITIES TAB ──────────────────────────────────────────────────────────────

const CitiesTab: React.FC<{
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  regions: Region[];
  countries: Country[];
}> = ({ cities, setCities, regions, countries }) => {
  const [search,        setSearch]        = useState('');
  const [countryFilter, setCountryFilter] = useState(0);
  const [regionFilter,  setRegionFilter]  = useState(0);
  const [viewItem,      setViewItem]      = useState<City | null>(null);
  const [editItem,      setEditItem]      = useState<City | null>(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [deleteId,      setDeleteId]      = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', regionId: 0 });
  const [modalCountryFilter, setModalCountryFilter] = useState(0);

  const filteredRegionsForFilter = useMemo(() =>
    countryFilter === 0 ? regions : regions.filter(r => r.countryId === countryFilter),
    [regions, countryFilter]);

  const filteredRegionsForModal = useMemo(() =>
    modalCountryFilter === 0 ? regions : regions.filter(r => r.countryId === modalCountryFilter),
    [regions, modalCountryFilter]);

  const filtered = useMemo(() => {
    return cities.filter(c => {
      const region = regions.find(r => r.id === c.regionId);
      const matchRegion  = regionFilter === 0 || c.regionId === regionFilter;
      const matchCountry = countryFilter === 0 || region?.countryId === countryFilter;
      const matchSearch  = c.name.toLowerCase().includes(search.toLowerCase());
      return matchRegion && matchCountry && matchSearch;
    });
  }, [cities, search, regionFilter, countryFilter, regions]);

  const regionOf  = (id: number) => regions.find(r => r.id === id);
  const countryOf = (regionId: number) => {
    const region = regions.find(r => r.id === regionId);
    return region ? countries.find(c => c.id === region.countryId) : undefined;
  };

  const openAdd = () => {
    setForm({ name: '', regionId: 0 });
    setModalCountryFilter(0);
    setAddOpen(true);
  };

  const openEdit = (c: City) => {
    const region = regionOf(c.regionId);
    setModalCountryFilter(region?.countryId ?? 0);
    setForm({ name: c.name, regionId: c.regionId });
    setEditItem(c);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.regionId) return;
    setCities(prev => [...prev, { id: nextId(prev), name: form.name, regionId: form.regionId }]);
    setAddOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setCities(prev => prev.map(c => c.id === editItem.id ? { ...c, ...form } : c));
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId !== null) setCities(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search cities…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm
              focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={countryFilter}
          onChange={e => { setCountryFilter(Number(e.target.value)); setRegionFilter(0); }}
          className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
        >
          <option value={0}>All Countries</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
        </select>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(Number(e.target.value))}
          className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
        >
          <option value={0}>All Regions</option>
          {filteredRegionsForFilter.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add City
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
        <span className="font-medium text-foreground">{cities.length}</span> cities
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No cities found</td>
                </tr>
              ) : filtered.map(city => {
                const region  = regionOf(city.regionId);
                const country = countryOf(city.regionId);
                return (
                  <tr key={city.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{city.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {city.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{region?.name ?? '—'}</td>
                    <td className="hidden md:table-cell px-4 py-3">
                      {country && (
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-sm text-muted-foreground">{country.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(city)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(city)}    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(city.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (() => {
        const region  = regionOf(viewItem.regionId);
        const country = countryOf(viewItem.regionId);
        return (
          <ViewModal
            title={viewItem.name}
            onClose={() => setViewItem(null)}
            rows={[
              { label: 'ID',      value: viewItem.id },
              { label: 'Name',    value: viewItem.name },
              { label: 'Region',  value: region?.name ?? '—' },
              { label: 'Country', value: country ? `${country.flag} ${country.name}` : '—' },
            ]}
          />
        );
      })()}

      {/* Add / Edit Modal */}
      {(addOpen || editItem) && (
        <FormModal
          title={editItem ? 'Edit City' : 'Add City'}
          onClose={() => { setAddOpen(false); setEditItem(null); setModalCountryFilter(0); }}
          onSubmit={editItem ? handleEdit : handleAdd}
          submitLabel={editItem ? 'Update City' : 'Add City'}
        >
          <Field label="City Name *">
            <TInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Colombo" required />
          </Field>
          <Field label="Country (filter regions)">
            <select
              value={modalCountryFilter}
              onChange={e => { setModalCountryFilter(Number(e.target.value)); setForm(p => ({ ...p, regionId: 0 })); }}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0}>All Countries</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Region *">
            <select
              value={form.regionId}
              onChange={e => setForm(p => ({ ...p, regionId: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={0} disabled>Select a region</option>
              {filteredRegionsForModal.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
        </FormModal>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete City"
        message="Are you sure you want to delete this city? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'countries', label: 'Countries', icon: <Globe  className="w-4 h-4" /> },
  { key: 'regions',   label: 'Regions',   icon: <Map    className="w-4 h-4" /> },
  { key: 'cities',    label: 'Cities',    icon: <MapPin className="w-4 h-4" /> },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('countries');
  const [countries, setCountries] = useState<Country[]>(seedCountries);
  const [regions,   setRegions]   = useState<Region[]>(seedRegions);
  const [cities,    setCities]    = useState<City[]>(seedCities);

  const regionCount = (countryId: number) => regions.filter(r => r.countryId === countryId).length;
  const cityCount   = (regionId: number)  => cities.filter(c => c.regionId === regionId).length;

  const tabCount = { countries: countries.length, regions: regions.length, cities: cities.length };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage location data — countries, regions, and cities used across the platform.
          </p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'countries' as Tab, label: 'Countries', icon: <Globe  className="w-5 h-5" />, color: 'text-blue-500'   },
          { key: 'regions'   as Tab, label: 'Regions',   icon: <Map    className="w-5 h-5" />, color: 'text-purple-500' },
          { key: 'cities'    as Tab, label: 'Cities',    icon: <MapPin className="w-5 h-5" />, color: 'text-emerald-500'},
        ]).map(s => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`glass-card p-4 text-left hover-lift transition-all ${activeTab === s.key ? 'ring-2 ring-ring' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`${activeTab === s.key ? s.color : 'text-muted-foreground'} transition-colors`}>
                {s.icon}
              </span>
              {activeTab === s.key && <Check className="w-3.5 h-3.5 text-primary" />}
            </div>
            <p className="text-2xl font-bold text-foreground">{tabCount[s.key]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Hierarchy breadcrumb */}
      <div className="flex items-center gap-2 text-sm glass-card px-4 py-3">
        <Globe  className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="font-medium text-foreground">Country</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <Map    className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="font-medium text-foreground">Region</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="font-medium text-foreground">City</span>
        <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
          Each country contains regions · Each region contains cities
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === tab.key
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {tabCount[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'countries' && (
        <CountriesTab countries={countries} setCountries={setCountries} regionCount={regionCount} />
      )}
      {activeTab === 'regions' && (
        <RegionsTab regions={regions} setRegions={setRegions} countries={countries} cityCount={cityCount} />
      )}
      {activeTab === 'cities' && (
        <CitiesTab cities={cities} setCities={setCities} regions={regions} countries={countries} />
      )}

    </div>
  );
};

export default AdminSettings;