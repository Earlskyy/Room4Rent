'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isTenant } from '@/lib/auth';
import { tenantAPI, billAPI } from '@/lib/services';
import { formatDate, getDueStatus } from '@/lib/dateUtils';
import TenantLayout from '@/components/TenantLayout';

export default function BillBreakdownPage() {
  const router = useRouter();
  const [bill, setBill] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [meter, setMeter] = useState(null);
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

    const fetchData = async () => {
      try {
        const user = getUser();
        const tenantResponse = await tenantAPI.getTenantByUserId(user.id);
        setTenant(tenantResponse.data);

        try {
          const billResponse = await billAPI.getCurrentBill(tenantResponse.data.id);
          setBill(billResponse.data);
        } catch (err) {
          setError('No current bill available');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <TenantLayout><div className="text-center py-10">Loading...</div></TenantLayout>;

  if (!bill) {
    return (
      <TenantLayout>
        <div className="text-center py-10">
          <p className="text-gray-600">{error || 'No bill available'}</p>
        </div>
      </TenantLayout>
    );
  }

  if (!isClient) return null;

  const dueStatus = getDueStatus(bill.due_date, bill.status);

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Bill Breakdown</h1>
          <p className="text-slate-400 mt-2">Month: {bill.month}/{bill.year}</p>
        </div>

        {dueStatus && (
          <div className={`p-4 rounded-xl border-2 text-sm font-semibold ${
            dueStatus.type === 'error'
              ? 'bg-red-900/50 border-red-700/50 text-red-200'
              : 'bg-yellow-900/50 border-yellow-700/50 text-yellow-200'
          }`}>
            {dueStatus.message}
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 p-8 hover:shadow-xl transition">
          <h2 className="text-2xl font-bold mb-8 text-white">Charges Breakdown</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <span className="text-slate-300 font-medium">Room Fee ({tenant?.room_name})</span>
              <span className="font-bold text-white text-lg">₱{parseFloat(bill.room_fee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <span className="text-slate-300 font-medium">Internet Fee</span>
              <span className="font-bold text-white text-lg">₱{parseFloat(bill.internet_fee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <span className="text-slate-300 font-medium">
                Water Fee ({tenant?.number_of_occupants} occupant{tenant?.number_of_occupants !== 1 ? 's' : ''} × ₱100)
              </span>
              <span className="font-bold text-white text-lg">₱{parseFloat(bill.water_fee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pb-4">
              <span className="text-slate-300 font-medium">Electricity Usage</span>
              <span className="font-bold text-white text-lg">₱{parseFloat(bill.electricity_fee).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-lg border border-orange-500/30">
            <span className="text-white font-bold text-lg">Total Amount Due</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">₱{parseFloat(bill.total_amount).toFixed(2)}</span>
          </div>

          <div className="mt-8 space-y-3 p-6 bg-slate-700/30 rounded-lg border border-slate-700">
            <p className="text-slate-300">
              <span className="font-semibold text-white">Due Date:</span> {formatDate(bill.due_date)}
            </p>
            <p className="text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-white">Status:</span>
              <span
                className={`px-4 py-2 rounded-full text-white font-bold text-sm ${
                  bill.status === 'paid'
                    ? 'bg-green-500'
                    : bill.status === 'overdue'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              >
                {bill.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <a href="/tenant/history" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center">
            ← Back to History
          </a>
          <a href="/tenant/receipts" className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center">
            Download Receipt →
          </a>
        </div>
      </div>
    </TenantLayout>
  );
}
