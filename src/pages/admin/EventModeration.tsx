import React, { useState } from 'react';
import { mockEvents } from '@/data/mockData';
import { EventItem } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import {
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Eye,
  X
} from 'lucide-react';

const EventModeration: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [viewItem, setViewItem] = useState<EventItem | null>(null);

  const updateStatus = (id: string, status: EventItem['status']) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === id ? { ...ev, status } : ev))
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      setEvents(prev => prev.filter(ev => ev.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setEvents(prev =>
      prev.map(ev => (ev.id === editItem.id ? editItem : ev))
    );
    setEditItem(null);
  };

  const statusStyles: Record<string, string> = {
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Event Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and moderate events submitted by users
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Event
                </th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Date
                </th>
                <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Venue
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">
                      {ev.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ev.city}, {ev.region}
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {new Date(ev.dateTime).toLocaleDateString()}
                  </td>

                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {ev.venue}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[ev.status]}`}
                    >
                      {ev.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">

                      {/* View */}
                      <button
                        onClick={() => setViewItem(ev)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve */}
                      {ev.status !== 'approved' && (
                        <button
                          onClick={() => updateStatus(ev.id, 'approved')}
                          className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Reject */}
                      {ev.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(ev.id, 'rejected')}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => setEditItem(ev)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
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

      {/* VIEW MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{viewItem.name}</h2>
              <button onClick={() => setViewItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Date & Time:</span>{" "}
                {new Date(viewItem.dateTime).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Region:</span>{" "}
                {viewItem.region}
              </div>
              <div>
                <span className="font-medium">City:</span>{" "}
                {viewItem.city}
              </div>
              <div>
                <span className="font-medium">Venue:</span>{" "}
                {viewItem.venue}
              </div>
              <div>
                <span className="font-medium">Contact:</span>{" "}
                {viewItem.contact}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={`px-2 py-1 rounded text-xs capitalize ${statusStyles[viewItem.status]}`}>
                  {viewItem.status}
                </span>
              </div>
              {viewItem.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-muted-foreground">
                    {viewItem.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setEditItem(null)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Event</h2>
              <button onClick={() => setEditItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              />

              <input
                type="datetime-local"
                value={editItem.dateTime}
                onChange={(e) =>
                  setEditItem({ ...editItem, dateTime: e.target.value })
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              />

              <input
                type="text"
                value={editItem.venue}
                onChange={(e) =>
                  setEditItem({ ...editItem, venue: e.target.value })
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              />

              <textarea
                value={editItem.description}
                onChange={(e) =>
                  setEditItem({ ...editItem, description: e.target.value })
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
              />

              <button
                onClick={handleEditSave}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
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

export default EventModeration;
