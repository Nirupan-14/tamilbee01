import React, { useState } from 'react';
import { mockPayments, mockUsers } from '@/data/mockData';
import { Payment } from '@/types';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Eye, X, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const AdminPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [viewItem, setViewItem] = useState<Payment | null>(null);
  const [editItem, setEditItem] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const updateStatus = (id: string, status: Payment['status']) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      setPayments(prev => prev.filter(p => p.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleEditSave = () => {
    if (!editItem) return;
    setPayments(prev =>
      prev.map(p => (p.id === editItem.id ? editItem : p))
    );
    setEditItem(null);
  };

  const statusStyles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View, edit, and manage all user payments
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{getUserName(p.userId)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">${p.amount}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">

                      {/* View */}
                      <button onClick={() => setViewItem(p)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Quick Patch Status */}
                      {p.status !== 'paid' && (
                        <button onClick={() => updateStatus(p.id, 'paid')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors" title="Mark as Paid">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {p.status !== 'pending' && (
                        <button onClick={() => updateStatus(p.id, 'pending')} className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-100 transition-colors" title="Mark as Pending">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit */}
                      <button onClick={() => setEditItem(p)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
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
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setViewItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">User:</span> {getUserName(viewItem.userId)}</div>
              <div><span className="font-medium">Amount:</span> ${viewItem.amount}</div>
              <div><span className="font-medium">Date:</span> {viewItem.date}</div>
              <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[viewItem.status]}`}>{viewItem.status}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Payment</h2>
              <button onClick={() => setEditItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium mb-1">User</label>
                <select
                  value={editItem.userId}
                  onChange={e => setEditItem({ ...editItem, userId: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  {mockUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={editItem.amount}
                  onChange={e => setEditItem({ ...editItem, amount: Number(e.target.value) })}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={editItem.date}
                  onChange={e => setEditItem({ ...editItem, date: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Status</label>
                <select
                  value={editItem.status}
                  onChange={e => setEditItem({ ...editItem, status: e.target.value as Payment['status'] })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <button
                onClick={handleEditSave}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
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
        title="Delete Payment"
        message="Are you sure you want to delete this payment?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminPaymentManagement;
