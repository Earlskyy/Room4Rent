'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isTenant } from '@/lib/auth';
import { tenantAPI, billAPI } from '@/lib/services';
import TenantLayout from '@/components/TenantLayout';
import { formatDate, formatDateTime } from '@/lib/dateUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReceiptsPage() {
  const router = useRouter();
  const receiptRef = useRef();
  const [bills, setBills] = useState([]);
  const [billsWithPayments, setBillsWithPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    if (!isTenant()) {
      router.push('/auth/login');
      return;
    }

    const fetchBills = async () => {
      try {
        const user = getUser();
        const tenantResponse = await tenantAPI.getTenantByUserId(user.id);
        const tenantData = tenantResponse.data;
        setTenantInfo(tenantData);

        const billsResponse = await billAPI.getTenantBills(tenantData.id);
        // Filter only paid bills
        const paidBills = billsResponse.data.filter(b => b.status === 'paid');
        setBills(paidBills);

        // Fetch payment history for each bill
        const billsPayments = {};
        for (const bill of paidBills) {
          try {
            const paymentResponse = await billAPI.getPaymentHistory(bill.id);
            billsPayments[bill.id] = paymentResponse.data;
          } catch (err) {
            billsPayments[bill.id] = [];
          }
        }
        setBillsWithPayments(billsPayments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load receipts');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [router]);

  const handleViewReceipt = (bill) => {
    setSelectedBill(bill);
    setShowReceiptModal(true);
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const filename = `receipt_${selectedBill.month}_${selectedBill.year}_${tenantInfo?.user?.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  if (loading)
    return (
      <TenantLayout>
        <div className="text-center py-10 text-white">Loading...</div>
      </TenantLayout>
    );

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📋 Receipt Downloads</h1>
          <p className="text-slate-300">View and download your paid bill receipts</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {bills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6 hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Receipt {bill.month}/{bill.year}</h3>
                    <p className="text-slate-400 text-sm">Room: {bill.room_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">₱{parseFloat(bill.total_amount).toFixed(2)}</div>
                    <div className="text-xs text-green-400 font-semibold">✓ PAID</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-slate-300">
                  <p>
                    <strong>Period:</strong>{' '}
                    {bill.billing_period_start && bill.billing_period_end
                      ? `${formatDate(bill.billing_period_start)} to ${formatDate(bill.billing_period_end)}`
                      : `${bill.month}/${bill.year}`}
                  </p>
                  <p>
                    <strong>Paid:</strong> {billsWithPayments[bill.id]?.[0] ? formatDateTime(billsWithPayments[bill.id][0].payment_date) : 'Date unavailable'}
                  </p>
                </div>

                <button
                  onClick={() => handleViewReceipt(bill)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  View Receipt
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-slate-400 text-lg">No paid bills available for download</p>
            <p className="text-slate-500 text-sm mt-2">Your paid receipts will appear here</p>
          </div>
        )}

        <a href="/tenant" className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all">
          ← Back to Dashboard
        </a>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedBill && billsWithPayments[selectedBill.id] && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Receipt Content */}
            <div ref={receiptRef} className="p-8 space-y-6">
              {/* Header */}
              <div className="border-b pb-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-gradient-to-br from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold text-xl mb-2">
                    TR
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Tonfox Rooms</h2>
                  <p className="text-sm text-gray-600">Affordable Rooms you can stay !</p>
                </div>
              </div>

              {/* Receipt Number and Date */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Receipt #</p>
                  <p className="font-bold text-gray-900">{selectedBill.month}-{selectedBill.year}-{selectedBill.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Receipt Date</p>
                  <p className="font-bold text-gray-900">{formatDate(new Date())}</p>
                </div>
              </div>

              {/* Tenant Information */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-gray-900 mb-3">Tenant Information</h3>
                {tenantInfo && tenantInfo.user ? (
                  <>
                    <p className="text-gray-600">
                      <strong>Name:</strong> {tenantInfo.user.name || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong> {tenantInfo.user.email || 'N/A'}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm italic">Tenant information not available</p>
                )}
                <p className="text-gray-600">
                  <strong>Room:</strong> {selectedBill.room_name || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <strong>Billing Period:</strong>{' '}
                  {selectedBill.billing_period_start && selectedBill.billing_period_end
                    ? `Billing As of ${formatDate(selectedBill.billing_period_start)} to ${formatDate(selectedBill.billing_period_end)}`
                    : `${selectedBill.month}/${selectedBill.year}`}
                </p>
                <p className="text-gray-600">
                  <strong>Due Date:</strong> {formatDate(selectedBill.due_date)}
                </p>
              </div>

              {/* Bill Breakdown */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-gray-900 mb-2">Bill Breakdown</h3>
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
                  <p className="flex justify-between font-bold mt-2 pt-2 border-t text-gray-900">
                    <span>Total Due:</span>
                    <span>₱{parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-gray-900 mb-2">Payment Details</h3>
                {billsWithPayments[selectedBill.id]?.map((payment, idx) => (
                  <div key={idx} className="text-sm space-y-2">
                    <p className="flex justify-between">
                      <span>Payment Date:</span>
                      <span>{formatDateTime(payment.payment_date)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{payment.payment_method}</span>
                    </p>
                    <p className="flex justify-between font-bold mt-2 pt-2 border-t text-gray-900">
                      <span>Amount Paid:</span>
                      <span>₱{parseFloat(payment.amount_paid).toFixed(2)}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-600">Thank you for your payment!</p>
                <p className="text-xs text-gray-600">This is an official receipt from Tonfox Rooms</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-8 py-4 flex gap-3 sticky bottom-0 border-t">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                🖨️ Print
              </button>
              <button
                onClick={downloadPDF}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedBill(null);
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </TenantLayout>
  );
}
