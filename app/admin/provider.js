// Admin authentication context and provider
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored) setAdmin(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Hardcoded credentials from .env.local
    if (
      email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || email === 'admin@anabeya.com'
    ) {
      if (
        password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123'
      ) {
        setAdmin({ email });
        localStorage.setItem('admin-auth', JSON.stringify({ email }));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin-auth');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
