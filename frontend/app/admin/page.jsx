'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAdmin } from '@/lib/auth';
import { dashboardAPI, roomAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/auth/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) return <AdminLayout><div className="text-center py-10">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Monthly Income"
              value={`₱${stats.totalIncome ? stats.totalIncome.toFixed(2) : '0.00'}`}
              color="bg-blue-500"
            />
            <StatCard
              title="Unpaid Bills"
              value={`₱${stats.totalUnpaid ? stats.totalUnpaid.toFixed(2) : '0.00'}`}
              color="bg-red-500"
            />
            <StatCard
              title="Occupied Rooms"
              value={stats.occupiedRooms}
              color="bg-green-500"
            />
            <StatCard
              title="Vacant Rooms"
              value={stats.vacantRooms}
              color="bg-yellow-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Manage Rooms"
            description="Add, edit, or delete rooms"
            href="/admin/rooms"
          />
          <QuickActionCard
            title="Manage Tenants"
            description="View and manage tenant accounts"
            href="/admin/tenants"
          />
          <QuickActionCard
            title="Input Fees & Readings"
            description="Record all tenant fees (water, electricity, internet)"
            href="/admin/meter-readings"
          />
          <QuickActionCard
            title="Generate Bills"
            description="Create monthly bills for tenants"
            href="/admin/bills"
          />
          <QuickActionCard
            title="Record Payments"
            description="Log tenant payments"
            href="/admin/payments"
          />
          <QuickActionCard
            title="View Reports"
            description="Monthly income and billing reports"
            href="/admin/reports"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-slate-500 transition-all">
      <div className={`${color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mb-4`}>
        📊
      </div>
      <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-white">{value}</p>
    </div>
  );
}

function QuickActionCard({ title, description, href }) {
  return (
    <a href={href} className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-orange-500/50 transition-all cursor-pointer">
      <h3 className="text-xl font-bold text-orange-400 mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
      <div className="mt-4 text-orange-400 font-medium">→</div>
    </a>
  );
}
