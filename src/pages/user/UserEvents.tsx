import React, { useState } from 'react';
import { mockEvents } from '@/data/mockData';
import { EventItem } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  X,
  Upload,
  MapPin,
  Clock,
  Calendar,
  Eye
} from 'lucide-react';

const emptyEvent: Omit<EventItem, 'id' | 'status' | 'createdBy'> = {
  name: '',
  dateTime: '',
  region: '',
  city: '',
  venue: '',
  contact: '',
  description: '',
  posterUrl: '',
};

const UserEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(
    mockEvents.filter(e => e.createdBy === '1')
  );

  const [view, setView] = useState<'table' | 'card'>('table');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [viewItem, setViewItem] = useState<EventItem | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyEvent);
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setForm(ev);
    setEditing(ev);
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      setEvents(prev =>
        prev.map(ev =>
          ev.id === editing.id ? { ...ev, ...form } : ev
        )
      );
    } else {
      setEvents(prev => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          status: 'pending',
          createdBy: '1'
        } as EventItem
      ]);
    }

    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setEvents(prev => prev.filter(ev => ev.id !== deleteId));
    }
    setDeleteId(null);
  };

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const fields = [
    { key: 'name', label: 'Event Name', placeholder: 'Tech Conference' },
    { key: 'dateTime', label: 'Date & Time', type: 'datetime-local', placeholder: '' },
    { key: 'region', label: 'Region', placeholder: 'Northeast' },
    { key: 'city', label: 'City', placeholder: 'New York' },
    { key: 'venue', label: 'Venue', placeholder: 'Convention Center' },
    { key: 'contact', label: 'Contact', placeholder: 'email@example.com' },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('table')}
              className={`p-2 ${
                view === 'table'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              } transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('card')}
              className={`p-2 ${
                view === 'card'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              } transition-colors`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map(ev => (
                  <tr
                    key={ev.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {ev.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(ev.dateTime).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {ev.venue}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewItem(ev)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEdit(ev)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteId(ev.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
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

      {/* CARD VIEW */}
      {view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.id} className="glass-card hover-lift p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {ev.name}
                </h3>
                <StatusBadge status={ev.status} />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(ev.dateTime).toLocaleString()}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {ev.venue}, {ev.city}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {ev.description}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setViewItem(ev)}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  View
                </button>

                <button
                  onClick={() => openEdit(ev)}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteId(ev.id)}
                  className="py-2 px-3 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {viewItem.name}
              </h2>
              <button
                onClick={() => setViewItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div><strong>Date:</strong> {new Date(viewItem.dateTime).toLocaleString()}</div>
              <div><strong>Region:</strong> {viewItem.region}</div>
              <div><strong>City:</strong> {viewItem.city}</div>
              <div><strong>Venue:</strong> {viewItem.venue}</div>
              <div><strong>Contact:</strong> {viewItem.contact}</div>
              <div><strong>Status:</strong> <StatusBadge status={viewItem.status} /></div>
              {viewItem.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{viewItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? 'Edit Event' : 'Add Event'}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type || 'text'}
                      value={(form as any)[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                      required
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Poster
                </label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload poster image
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || 'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
};

export default UserEvents;
