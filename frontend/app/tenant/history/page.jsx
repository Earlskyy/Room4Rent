'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isTenant } from '@/lib/auth';
import { tenantAPI, billAPI } from '@/lib/services';
import TenantLayout from '@/components/TenantLayout';

export default function BillingHistoryPage() {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isTenant()) {
      router.push('/auth/login');
      return;
    }

    const fetchBills = async () => {
      try {
        const user = getUser();
        const tenantResponse = await tenantAPI.getTenantByUserId(user.id);
        const billsResponse = await billAPI.getTenantBills(tenantResponse.data.id);
        setBills(billsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [router]);

  if (loading) return <TenantLayout><div className="text-center py-10">Loading...</div></TenantLayout>;

  return (
    <TenantLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Billing History</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Month/Year</th>
                  <th className="px-6 py-3 text-left font-semibold">Total Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{bill.month}/{bill.year}</td>
                    <td className="px-6 py-3">₱{parseFloat(bill.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-3">{bill.due_date}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                          bill.status === 'paid'
                            ? 'bg-green-500'
                            : bill.status === 'overdue'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {bill.status === 'paid' ? 'View Receipt' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No billing history available</p>
          </div>
        )}

        <a href="/tenant" className="btn-secondary">
          ← Back to Dashboard
        </a>
      </div>
    </TenantLayout>
  );
}
