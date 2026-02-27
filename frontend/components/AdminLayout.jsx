'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Rooms', href: '/admin/rooms', icon: '🏠' },
    { label: 'Tenants', href: '/admin/tenants', icon: '👥' },
    { label: 'Fee Management', href: '/admin/meter-readings', icon: '⚡' },
    { label: 'Bills', href: '/admin/bills', icon: '💵' },
    { label: 'Reports', href: '/admin/reports', icon: '📈' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 left-0 h-screen z-40
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 text-white
          transition-all duration-300 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center font-bold text-lg">
              TR
            </div>
            {sidebarOpen && <h1 className="font-bold text-xl">Tonfox</h1>}
          </div>

          {/* Mobile Close */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}>✕</button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition text-slate-300 hover:text-white"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg hover:bg-slate-700/50"
            >
              {sidebarOpen ? '◄' : '►'}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg hover:from-orange-500 hover:to-red-600 transition font-medium text-white"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 w-full">
        {/* Mobile Top Bar */}
        {isMobile && (
          <div className="p-4 flex items-center justify-between bg-slate-900 border-b border-slate-700 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white text-2xl"
            >
              ☰
            </button>
            <h1 className="text-white font-bold">Tonfox Admin</h1>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}