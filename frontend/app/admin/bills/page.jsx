'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { billAPI, tenantAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function BillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showIndividualReceiptModal, setShowIndividualReceiptModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [expandedBillId, setExpandedBillId] = useState(null);
  const [billForm, setBillForm] = useState({
    tenant_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    due_date: '',
    billing_period_start: '',
    billing_period_end: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_date: '',
    payment_method: 'cash',
  });

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/auth/login');
      return;
    }
    fetchBills();
    fetchTenants();
  }, [router]);

  const fetchBills = async () => {
    try {
      const response = await billAPI.getAllBills();
      setBills(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getTenants();
      setTenants(response.data);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      await billAPI.generateBill(billForm);
      setBillForm({
        tenant_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        due_date: '',
      });
      setShowBillModal(false);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const calculateBillingPeriod = (month, year) => {
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
  };

  const handleMonthYearChange = (month, year) => {
    const { firstDay, lastDay } = calculateBillingPeriod(month, year);
    setBillForm({
      ...billForm,
      month,
      year,
      billing_period_start: firstDay,
      billing_period_end: lastDay,
    });
  };

  const handleOpenBillModal = () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const { firstDay, lastDay } = calculateBillingPeriod(month, year);
    setBillForm({
      tenant_id: '',
      month,
      year,
      due_date: '',
      billing_period_start: firstDay,
      billing_period_end: lastDay,
    });
    setShowBillModal(true);
  };

  const handleOpenPaymentModal = (bill) => {
    // Auto-fill current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const datetimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

    setSelectedBill(bill);
    setPaymentForm({
      amount_paid: '',
      payment_date: datetimeString,
      payment_method: 'cash',
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await billAPI.recordPayment({
        bill_id: selectedBill.id,
        ...paymentForm,
        amount_paid: parseFloat(paymentForm.amount_paid),
      });
      setPaymentForm({
        amount_paid: '',
        payment_date: '',
        payment_method: 'cash',
      });
      setShowPaymentModal(false);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleViewReceipt = async (bill) => {
    try {
      const response = await billAPI.getPaymentHistory(bill.id);
      setPaymentHistory(response.data);
      setSelectedBill(bill);
      setExpandedBillId(expandedBillId === bill.id ? null : bill.id);
    } catch (err) {
      setError('Failed to load payment history');
    }
  };

  const handleViewPaymentReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowIndividualReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) return <AdminLayout><div className="text-center py-10 text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-white">Billing Management</h1>
          <button
            onClick={handleOpenBillModal}
            className="btn-primary"
          >
            + Generate Bill
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-white">Tenant</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Month/Year</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white">{bill.name}</td>
                  <td className="px-4 py-3 text-white">₱{parseFloat(bill.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-white">{bill.month}/{bill.year}</td>
                  <td className="px-4 py-3 text-white">{bill.due_date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : bill.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : bill.status === 'partially paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleViewReceipt(bill)}
                      className="text-green-400 hover:text-green-300 text-sm mr-2"
                    >
                      {expandedBillId === bill.id ? '▼ Receipts' : '▶ Receipts'}
                    </button>
                    <button
                      onClick={() => handleOpenPaymentModal(bill)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expandedBillId && paymentHistory.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-3">Payment History</h3>
            <div className="space-y-2">
              {paymentHistory.map((payment, idx) => {
                const payDate = new Date(payment.payment_date);
                const formattedDate = payDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                const formattedTime = payDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                return (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div>
                      <p className="font-medium">{formattedDate} at {formattedTime}</p>
                      <p className="text-slate-300 text-sm">Method: {payment.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{parseFloat(payment.amount_paid).toFixed(2)}</p>
                      <button
                        onClick={() => handleViewPaymentReceipt(payment)}
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showBillModal && (
          <Modal onClose={() => setShowBillModal(false)}>
            <form onSubmit={handleGenerateBill} className="space-y-4">
              <h2 className="text-2xl font-bold">Generate Bill</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Select Tenant</label>
                <select
                  value={billForm.tenant_id}
                  onChange={(e) => setBillForm({ ...billForm, tenant_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.room_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={billForm.month}
                    onChange={(e) => handleMonthYearChange(parseInt(e.target.value), billForm.year)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={billForm.year}
                    onChange={(e) => handleMonthYearChange(billForm.month, parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={billForm.due_date}
                  onChange={(e) => setBillForm({ ...billForm, due_date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Billing Period Start</label>
                  <input
                    type="date"
                    value={billForm.billing_period_start}
                    onChange={(e) => setBillForm({ ...billForm, billing_period_start: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Billing Period End</label>
                  <input
                    type="date"
                    value={billForm.billing_period_end}
                    onChange={(e) => setBillForm({ ...billForm, billing_period_end: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Generate Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showPaymentModal && selectedBill && (
          <Modal onClose={() => { setShowPaymentModal(false); setSelectedBill(null); }}>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <h2 className="text-2xl font-bold">Record Payment</h2>
              <p className="text-gray-600">Bill Total: ₱{parseFloat(selectedBill.total_amount).toFixed(2)}</p>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date & Time</label>
                <input
                  type="datetime-local"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPaymentModal(false); setSelectedBill(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showIndividualReceiptModal && selectedPayment && selectedBill && (
          <Modal onClose={() => { setShowIndividualReceiptModal(false); setSelectedPayment(null); }}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Payment Receipt</h2>
                <button
                  onClick={handlePrintReceipt}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  🖨️ Print
                </button>
              </div>
              
              <div className="border-b pb-4">
                <p className="text-gray-600"><strong>Tenant:</strong> {selectedBill.name}</p>
                <p className="text-gray-600"><strong>Email:</strong> {selectedBill.email}</p>
                <p className="text-gray-600"><strong>Room:</strong> {selectedBill.room_name}</p>
                <p className="text-gray-600">
                  <strong>Billing Period:</strong> {
                    selectedBill.billing_period_start && selectedBill.billing_period_end 
                      ? `Billing As of ${new Date(selectedBill.billing_period_start).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} to ${new Date(selectedBill.billing_period_end).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`
                      : `${selectedBill.month}/${selectedBill.year}`
                  }
                </p>
                <p className="text-gray-600"><strong>Due Date:</strong> {selectedBill.due_date}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Bill Breakdown</h3>
                <div className="text-sm space-y-1">
                  <p className="flex justify-between">
                    <span>Room Fee:</span>
                    <span>₱{parseFloat(selectedBill.room_fee).toFixed(2)}</span>
                  </p>
                  {parseFloat(selectedBill.internet_fee) > 0 && (
                    <p className="flex justify-between">
                      <span>Internet Fee:</span>
                      <span>₱{parseFloat(selectedBill.internet_fee).toFixed(2)}</span>
                    </p>
                  )}
                  {parseFloat(selectedBill.water_fee) > 0 && (
                    <p className="flex justify-between">
                      <span>Water Fee:</span>
                      <span>₱{parseFloat(selectedBill.water_fee).toFixed(2)}</span>
                    </p>
                  )}
                  {parseFloat(selectedBill.electricity_fee) > 0 && (
                    <p className="flex justify-between">
                      <span>Electricity Fee:</span>
                      <span>₱{parseFloat(selectedBill.electricity_fee).toFixed(2)}</span>
                    </p>
                  )}
                  <p className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total Due:</span>
                    <span>₱{parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Payment Details</h3>
                <div className="text-sm space-y-2">
                  <p className="flex justify-between">
                    <span>Payment Date:</span>
                    <span>{new Date(selectedPayment.payment_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} at {new Date(selectedPayment.payment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{selectedPayment.payment_method}</span>
                  </p>
                  <p className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Amount Paid:</span>
                    <span>₱{parseFloat(selectedPayment.amount_paid).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setShowIndividualReceiptModal(false); setSelectedPayment(null); }}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
