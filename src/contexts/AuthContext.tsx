import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  signup: (data: Partial<User> & { password: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string, role: UserRole) => {
    setUser({
      id: '1',
      firstName: role === 'admin' ? 'Admin' : 'John',
      lastName: role === 'admin' ? 'User' : 'Doe',
      email,
      role,
      phone: '+1 555-0100',
      city: 'New York',
      address: '123 Main St',
      blocked: false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const signup = useCallback((data: Partial<User> & { password: string }) => {
    setUser({
      id: '1',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      role: 'user',
      phone: data.phone || '',
      city: data.city || '',
      address: data.address || '',
      blocked: false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
