'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { dashboardAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('income');
  const [year, setYear] = useState(new Date().getFullYear());
  const [incomeReport, setIncomeReport] = useState([]);
  const [unpaidReport, setUnpaidReport] = useState([]);
  const [utilityReport, setUtilityReport] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, [activeTab, year]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'income') {
        const response = await dashboardAPI.getIncomeReport(year);
        setIncomeReport(response.data);
      } else if (activeTab === 'unpaid') {
        const response = await dashboardAPI.getUnpaidBillsReport();
        setUnpaidReport(response.data);
      } else if (activeTab === 'utility') {
        const response = await dashboardAPI.getUtilityUsageReport(year);
        setUtilityReport(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'income'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Income Report
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'unpaid'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Unpaid Bills
          </button>
          <button
            onClick={() => setActiveTab('utility')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'utility'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Utility Usage
          </button>
        </div>

        {(activeTab === 'income' || activeTab === 'utility') && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field max-w-xs"
            />
          </div>
        )}

        {loading && <div className="text-center py-10">Loading...</div>}

        {activeTab === 'income' && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Month</th>
                  <th className="px-6 py-3 text-left font-semibold">Total Bills</th>
                  <th className="px-6 py-3 text-left font-semibold">Paid Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Paid Count</th>
                </tr>
              </thead>
              <tbody>
                {incomeReport.map((record) => (
                  <tr key={record.month} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">Month {record.month}</td>
                    <td className="px-6 py-3">₱{parseFloat(record.total).toFixed(2)}</td>
                    <td className="px-6 py-3">₱{parseFloat(record.paid_amount).toFixed(2)}</td>
                    <td className="px-6 py-3">{record.paid_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'unpaid' && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {unpaidReport.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{record.name}</td>
                    <td className="px-4 py-3">₱{parseFloat(record.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3">{record.due_date}</td>
                    <td className="px-4 py-3 font-bold">₱{parseFloat(record.remaining_balance).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'utility' && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-left font-semibold">Usage (kWh)</th>
                  <th className="px-4 py-3 text-left font-semibold">Electricity Cost</th>
                  <th className="px-4 py-3 text-left font-semibold">Water Fee</th>
                </tr>
              </thead>
              <tbody>
                {utilityReport.map((record, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{record.room_name}</td>
                    <td className="px-4 py-3">Month {record.month}</td>
                    <td className="px-4 py-3">{parseFloat(record.usage).toFixed(2)}</td>
                    <td className="px-4 py-3">₱{parseFloat(record.electricity_cost).toFixed(2)}</td>
                    <td className="px-4 py-3">₱{parseFloat(record.water_fee).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
