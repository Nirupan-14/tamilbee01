import React, { useState } from 'react';
import { Eye, Trash2, X, Pencil, CheckCircle, XCircle } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { SubscribedUser, mockSubscribedUsers } from '@/data/mockData';

const AdminSubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscribedUser[]>(mockSubscribedUsers);
  const [viewItem, setViewItem] = useState<SubscribedUser | null>(null);
  const [editItem, setEditItem] = useState<SubscribedUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateStatus = (id: string, status: 'active' | 'inactive') => {
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, status } : sub))
    );
  };

  const handleDelete = () => {
    if (deleteId) setSubscriptions(prev => prev.filter(sub => sub.id !== deleteId));
    setDeleteId(null);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === editItem.id ? editItem : sub))
    );
    setEditItem(null);
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success',
    inactive: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all user subscriptions
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Start Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">End Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">{sub.userId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{sub.planId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{sub.startDate}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{sub.endDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <button onClick={() => setViewItem(sub)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Activate / Deactivate */}
                      {sub.status !== 'active' && (
                        <button onClick={() => updateStatus(sub.id, 'active')} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors" title="Activate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {sub.status !== 'inactive' && (
                        <button onClick={() => updateStatus(sub.id, 'inactive')} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Deactivate">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit */}
                      <button onClick={() => setEditItem(sub)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button onClick={() => setDeleteId(sub.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
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
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Subscription Details</h2>
              <button onClick={() => setViewItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">User ID:</span> {viewItem.userId}</div>
              <div><span className="font-medium">Plan:</span> {viewItem.planId}</div>
              <div><span className="font-medium">Start Date:</span> {viewItem.startDate}</div>
              <div><span className="font-medium">End Date:</span> {viewItem.endDate}</div>
              <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs capitalize ${statusStyles[viewItem.status]}`}>{viewItem.status}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Subscription</h2>
              <button onClick={() => setEditItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={editItem.userId} onChange={e => setEditItem({ ...editItem, userId: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background" placeholder="User ID" />
              <input type="text" value={editItem.planId} onChange={e => setEditItem({ ...editItem, planId: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background" placeholder="Plan ID" />
              <input type="text" value={editItem.startDate} onChange={e => setEditItem({ ...editItem, startDate: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background" placeholder="Start Date" />
              <input type="text" value={editItem.endDate} onChange={e => setEditItem({ ...editItem, endDate: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 bg-background" placeholder="End Date" />
              <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal open={!!deleteId} title="Delete Subscription" message="Are you sure you want to delete this subscription?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default AdminSubscriptionManagement;
