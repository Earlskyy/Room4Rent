'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isTenant } from '@/lib/auth';
import { tenantAPI, billAPI } from '@/lib/services';
import { formatDate, formatDateTime, getDueStatus } from '@/lib/dateUtils';
import TenantLayout from '@/components/TenantLayout';

export default function TenantDashboard() {
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isTenant()) {
      router.push('/auth/login');
      return;
    }

    const fetchTenantData = async () => {
      try {
        const user = getUser();
        const tenantResponse = await tenantAPI.getTenantByUserId(user.id);
        setTenant(tenantResponse.data);

        try {
          const billResponse = await billAPI.getCurrentBill(tenantResponse.data.id);
          setCurrentBill(billResponse.data);
        } catch (err) {
          // No current bill yet, that's okay
          console.log('No current bill');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tenant data');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [router]);

  if (loading) return <TenantLayout><div className="text-center py-10">Loading...</div></TenantLayout>;

  if (!isClient) return null;

  const isOverdue = currentBill?.status === 'overdue';
  const isPaid = currentBill?.status === 'paid';
  const dueStatus = currentBill ? getDueStatus(currentBill.due_date, currentBill.status) : null;

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-2">Welcome back to Tonfox Rooms</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl">
            <p className="font-semibold">Error</p>
            {error}
          </div>
        )}

        {tenant && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Information Card */}
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-xl shadow-lg border border-blue-800/50 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  🏠
                </div>
                <h2 className="text-xl font-bold ml-3 text-white">Room Information</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-blue-800/30">
                  <span className="text-slate-300">Room:</span>
                  <span className="font-semibold text-white">{tenant.room_name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-blue-800/30">
                  <span className="text-slate-300">Move-in Date:</span>
                  <span className="font-semibold text-white">{formatDate(tenant.move_in_date)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-blue-800/30">
                  <span className="text-slate-300">Occupants:</span>
                  <span className="font-semibold text-white">{tenant.number_of_occupants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Contact:</span>
                  <span className="font-semibold text-white">{tenant.contact_number}</span>
                </div>
              </div>
            </div>

            {/* Current Bill Card */}
            {currentBill ? (
              <div className={`rounded-xl shadow-lg border p-6 hover:shadow-xl transition ${
                isPaid 
                  ? 'bg-gradient-to-br from-green-950 to-green-900 border-green-800/50 hover:shadow-green-500/20'
                  : isOverdue
                  ? 'bg-gradient-to-br from-red-950 to-red-900 border-red-800/50 hover:shadow-red-500/20'
                  : 'bg-gradient-to-br from-yellow-950 to-yellow-900 border-yellow-800/50 hover:shadow-yellow-500/20'
              }`}>
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${
                    isPaid ? 'bg-gradient-to-br from-green-400 to-green-500' : isOverdue ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                  }`}>
                    {isPaid ? '✓' : isOverdue ? '⚠️' : '📋'}
                  </div>
                  <h2 className="text-xl font-bold ml-3 text-white">Current Bill</h2>
                </div>

                {/* Due Status Alert */}
                {dueStatus && (
                  <div className={`mb-6 p-3 rounded-lg text-sm font-medium border ${
                    dueStatus.type === 'error'
                      ? 'bg-red-900/50 border-red-700/50 text-red-200'
                      : 'bg-yellow-900/50 border-yellow-700/50 text-yellow-200'
                  }`}>
                    {dueStatus.message}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Amount:</span>
                    <span className="text-2xl font-bold text-white">₱{parseFloat(currentBill.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-slate-300">Due Date:</span>
                    <span className="font-semibold text-white">{formatDate(currentBill.due_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Status:</span>
                    <span className={`px-4 py-2 rounded-full text-white text-sm font-bold ${
                      isPaid
                        ? 'bg-green-500'
                        : isOverdue
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}>
                      {currentBill.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <a href="/tenant/bills" className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg transition text-center block">
                  View Breakdown →
                </a>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-xl shadow-lg border border-indigo-800/50 p-6 hover:shadow-xl hover:shadow-indigo-500/20 transition">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">
                    ℹ️
                  </div>
                  <h2 className="text-xl font-bold ml-3 text-white">No Current Bill</h2>
                </div>
                <p className="text-slate-300">
                  There is no bill for the current month yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Links Section */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLinkCard
              icon="📊"
              title="Bill Breakdown"
              description="See charges"
              href="/tenant/bills"
              color="from-blue-600 to-blue-500"
            />
            <QuickLinkCard
              icon="📜"
              title="Billing History"
              description="View past bills"
              href="/tenant/history"
              color="from-purple-600 to-purple-500"
            />
            <QuickLinkCard
              icon="📄"
              title="Receipts"
              description="Download receipt"
              href="/tenant/receipts"
              color="from-green-600 to-green-500"
            />
            <QuickLinkCard
              icon="📢"
              title="Announcements"
              description="Latest updates"
              href="/announcements"
              color="from-orange-600 to-orange-500"
            />
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}

function QuickLinkCard({ icon, title, description, href, color }) {
  return (
    <a href={href} className={`bg-gradient-to-br ${color} rounded-xl shadow-sm hover:shadow-lg transition p-6 text-white cursor-pointer group`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-1 group-hover:underline">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
      <div className="mt-4 opacity-70 group-hover:opacity-100 transition">→</div>
    </a>
  );
}
