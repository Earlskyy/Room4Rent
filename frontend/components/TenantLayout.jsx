'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function TenantLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
              TR
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tonfox Rooms</h1>
              <p className="text-xs text-slate-400">{isClient ? user?.name : 'Loading...'}</p>
            </div>
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <a href="/tenant" className="text-slate-300 hover:text-orange-400 font-medium transition">
              Dashboard
            </a>
            <a href="/tenant/bills" className="text-slate-300 hover:text-orange-400 font-medium transition">
              My Bills
            </a>
            <a href="/announcements" className="text-slate-300 hover:text-orange-400 font-medium transition">
              Announcements
            </a>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold px-6 py-2 rounded-lg transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 p-4 space-y-3 border-t border-slate-700">
            <a href="/tenant" className="block text-slate-300 hover:text-orange-400 py-2">
              Dashboard
            </a>
            <a href="/tenant/bills" className="block text-slate-300 hover:text-orange-400 py-2">
              My Bills
            </a>
            <a href="/announcements" className="block text-slate-300 hover:text-orange-400 py-2">
              Announcements
            </a>
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 px-6 mt-16">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Tonfox Rooms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
