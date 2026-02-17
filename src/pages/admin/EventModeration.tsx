import React, { useState } from 'react';
import { mockEvents } from '@/data/mockData';
import { EventItem } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';

const EventModeration: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateStatus = (id: string, status: EventItem['status']) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
  };

  const handleDelete = () => {
    if (deleteId) setEvents(prev => prev.filter(ev => ev.id !== deleteId));
    setDeleteId(null);
  };

  const statusStyles: Record<string, string> = {
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Event Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and moderate events submitted by users</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Venue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{ev.name}</div>
                    <div className="text-xs text-muted-foreground">{ev.city}, {ev.region}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(ev.dateTime).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{ev.venue}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[ev.status]}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ev.status !== 'approved' && (
                        <button onClick={() => updateStatus(ev.id, 'approved')} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {ev.status !== 'rejected' && (
                        <button onClick={() => updateStatus(ev.id, 'rejected')} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(ev.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal open={!!deleteId} title="Delete Event" message="Are you sure you want to delete this event?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default EventModeration;
