import React, { useState } from 'react';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types';
import {
  ShieldCheck,
  ShieldOff,
  Mail,
  Phone,
  Eye,
  X,
  MapPin
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(
    mockUsers.filter(u => u.role === 'user')
  );

  const [viewUser, setViewUser] = useState<User | null>(null);

  const toggleBlock = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, blocked: !u.blocked } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage registered users
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  User
                </th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Contact
                </th>
                <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  City
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </span>
                    </div>
                  </td>

                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {user.city}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.blocked
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">

                      {/* View Button */}
                      <button
                        onClick={() => setViewUser(user)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Block / Unblock */}
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.blocked
                            ? 'bg-success/10 text-success hover:bg-success/20'
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        }`}
                      >
                        {user.blocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-3.5 h-3.5" />
                            Block
                          </>
                        )}
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
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setViewUser(null)}
          />

          <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {viewUser.firstName} {viewUser.lastName}
              </h2>
              <button onClick={() => setViewUser(null)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-sm">

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {viewUser.email}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {viewUser.phone}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {viewUser.city}
              </div>

              <div>
                <span className="font-medium">Status: </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    viewUser.blocked
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {viewUser.blocked ? 'Blocked' : 'Active'}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
