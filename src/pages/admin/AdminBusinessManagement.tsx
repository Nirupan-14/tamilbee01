import React, { useState } from 'react';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';
import { Eye, Trash2, X, Mail, Phone, Globe, MapPin } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';

const AdminBusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [viewItem, setViewItem] = useState<Business | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setBusinesses(prev => prev.filter(b => b.id !== deleteId));
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Business Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all registered businesses
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Business
                </th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Category
                </th>
                <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  City
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {businesses.map((biz) => (
                <tr
                  key={biz.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">
                      {biz.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {biz.company}
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {biz.category}
                  </td>

                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {biz.cityId}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">

                      {/* View */}
                      <button
                        onClick={() => setViewItem(biz)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(biz.id)}
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

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {viewItem.title}
              </h2>
              <button onClick={() => setViewItem(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-4 text-sm">

              <div>
                <span className="font-medium">Company:</span>{" "}
                {viewItem.company}
              </div>

              <div>
                <span className="font-medium">Category:</span>{" "}
                {viewItem.category}
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {viewItem.email}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {viewItem.telephone}
              </div>

              {viewItem.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={viewItem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {viewItem.website}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {viewItem.addressLine1}, {viewItem.cityId}, {viewItem.provinceId} {viewItem.postcode}
              </div>

              {viewItem.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-muted-foreground">
                    {viewItem.description}
                  </p>
                </div>
              )}

              {viewItem.moreInfo && (
                <div>
                  <span className="font-medium">More Info:</span>
                  <p className="mt-1 text-muted-foreground">
                    {viewItem.moreInfo}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Business"
        message="Are you sure you want to delete this business?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

    </div>
  );
};

export default AdminBusinessManagement;
