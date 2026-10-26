import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import type { Bill } from '../../types/pos';
import { ReceiptModal } from '../billing/ReceiptModal';
import { Html5Qrcode } from 'html5-qrcode';
import { FileText, Search, ShieldCheck, QrCode, AlertTriangle, CheckCircle, Eye, X, Sparkles } from 'lucide-react';
import { playSuccessChime, playWarningBuzz } from '../../utils/audio';

export const InvoicesView: React.FC = () => {
  const { bills } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Scanner State for Bill Verification (Feature C)
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    status: 'VERIFIED' | 'INVALID' | 'IDLE';
    message: string;
    bill?: Bill;
    scannedData?: Record<string, unknown>;
  }>({ status: 'IDLE', message: '' });

  const filteredBills = bills.filter(
    (b) =>
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone?.includes(search) ||
      b.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const startVerificationScanner = async () => {
    setIsVerifying(true);
    setVerifyResult({ status: 'IDLE', message: '' });

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('bill-verify-camera');
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            scanner.stop().catch(() => {}).then(() => scanner.clear());
            handleVerifyCode(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.warn(err);
      }
    }, 200);
  };

  const handleVerifyCode = (rawPayload: string) => {
    try {
      const data = JSON.parse(rawPayload);
      const matched = bills.find((b) => b.billNumber === data.id);

      if (matched && matched.verificationHash === data.sig) {
        playSuccessChime();
        setVerifyResult({
          status: 'VERIFIED',
          message: `Genuine Paid Invoice! Bill #${matched.billNumber} for ₹${matched.finalTotal} was paid via ${matched.paymentMethod}.`,
          bill: matched,
          scannedData: data,
        });
      } else {
        playWarningBuzz();
        setVerifyResult({
          status: 'INVALID',
          message: 'Security Alert: Bill verification signature mismatch or invoice not found in store database!',
          scannedData: data,
        });
      }
    } catch {
      playWarningBuzz();
      setVerifyResult({
        status: 'INVALID',
        message: 'Invalid QR format. This is not a SmartBill verification QR code.',
      });
    }
  };

  const simulateQuickVerification = (bill: Bill) => {
    const payload = JSON.stringify({
      v: 1,
      id: bill.billNumber,
      ts: bill.timestamp,
      n: bill.customerName,
      tot: bill.finalTotal,
      pm: bill.paymentMethod,
      st: bill.paymentStatus,
      sig: bill.verificationHash,
    });
    handleVerifyCode(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
      
      {/* Top Banner with Feature C: Gate Verification Scanner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-ios-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 bg-ios-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Fraud Bill Verification (Feature C)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Customer Receipts & Gate Security
          </h2>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-medium">
            Cashiers and gate security can scan the Verification QR on printed customer receipts to confirm authentic payment status.
          </p>
        </div>

        <button
          type="button"
          onClick={startVerificationScanner}
          className="z-10 inline-flex items-center gap-2 bg-ios-red hover:bg-ios-redHover text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Customer Bill QR</span>
        </button>
      </div>

      {/* Verification Scanner / Result Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-ios-red" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Scan Receipt Verification QR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVerifying(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verifyResult.status === 'IDLE' ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
                  <div id="bill-verify-camera" className="w-full h-full" />
                  <div className="absolute inset-10 border-2 border-dashed border-emerald-400 rounded-2xl pointer-events-none animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500 text-center font-medium">
                  Point camera at the QR code printed on the bottom of the customer's receipt
                </p>

                {/* Simulation trigger */}
                {bills.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      Or Test Verify with Recent Bill:
                    </span>
                    <button
                      type="button"
                      onClick={() => simulateQuickVerification(bills[0])}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Simulate Verify #{bills[0].billNumber}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : verifyResult.status === 'VERIFIED' ? (
              <div className="space-y-3 text-center py-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                    Official Authenticated Receipt
                  </span>
                  <h4 className="font-black text-xl text-slate-900 mt-1">
                    Invoice Valid & Paid
                  </h4>
                  <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto mt-1">
                    {verifyResult.message}
                  </p>
                </div>

                {verifyResult.bill && (
                  <div className="bg-slate-50 p-3 rounded-2xl text-left text-xs font-mono text-slate-700 space-y-1 border border-slate-200">
                    <div className="flex justify-between">
                      <span>Invoice No:</span>
                      <strong>{verifyResult.bill.billNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <strong className="text-emerald-700">₹{verifyResult.bill.finalTotal}.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{verifyResult.bill.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items Count:</span>
                      <span>{verifyResult.bill.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-full py-3 bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl"
                >
                  Confirm & Release Goods
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center py-3">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                    Fraud Warning
                  </span>
                  <h4 className="font-black text-lg text-slate-900 mt-1">
                    Invalid or Fake Receipt!
                  </h4>
                  <p className="text-xs text-rose-600 font-medium max-w-xs mx-auto mt-1">
                    {verifyResult.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl"
                >
                  Close Alert
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bill #, Customer name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 self-end sm:self-auto">
          <span>Total Invoices: <strong>{bills.length}</strong></span>
          <span>
            Total Revenue:{' '}
            <strong className="text-ios-red font-mono font-black text-sm">
              ₹{bills.reduce((sum, b) => sum + b.finalTotal, 0).toLocaleString('en-IN')}
            </strong>
          </span>
        </div>
      </div>

      {/* Bills Ledger List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-ios overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
            <p className="font-bold text-sm text-slate-600">No invoices generated yet</p>
            <p className="text-xs text-slate-400">Bills created in the Billing tab will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBills.map((bill) => {
              const dateStr = new Date(bill.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={bill.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Left: Invoice info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {bill.billNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          bill.paymentMethod === 'UPI'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : bill.paymentMethod === 'CASH'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {bill.paymentMethod}
                      </span>
                      {bill.isOwnerDiscountApproved && (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                          Owner Disc ({bill.discountPercent}%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{bill.customerName || 'Walk-in'}</span>
                      <span>•</span>
                      <span>{bill.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-slate-900 font-mono">
                        ₹{bill.finalTotal}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block -mt-1">
                        PAID
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBill(bill)}
                        title="View & Print Thermal Receipt"
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => simulateQuickVerification(bill)}
                        title="Verify this bill against security signature"
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Receipt Preview Modal */}
      <ReceiptModal
        bill={selectedBill}
        onClose={() => setSelectedBill(null)}
      />

    </div>
  );
};
