import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import type { PaymentMethod } from '../../types/pos';
import { buildUpiPaymentUrl, generateQrDataUrl } from '../../utils/qr';
import { QrCode, Banknote, CreditCard, X, CheckCircle2, User, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { cartTotal, completeSale, settings } = usePOS();
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<number>(cartTotal);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes

  // Generate dynamic amount-filled UPI QR whenever opened or amount changes
  useEffect(() => {
    if (!isOpen) return;

    setCashReceived(cartTotal);
    setTimeLeft(180);

    const upiUrl = buildUpiPaymentUrl({
      vpa: settings.upiId,
      merchantName: settings.upiMerchantName,
      amount: cartTotal,
      note: `Bill-${Date.now().toString().slice(-4)}`,
    });

    generateQrDataUrl(upiUrl, '#1C1C1E').then((url) => {
      setUpiQrUrl(url);
    });

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cartTotal, settings.upiId, settings.upiMerchantName]);

  if (!isOpen) return null;

  const handleFinalCheckout = (payMethod: PaymentMethod = method) => {
    // 1. Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DC2626', '#10B981', '#3B82F6', '#F59E0B'],
    });

    // 2. Complete sale in context
    completeSale(payMethod, customerName, customerPhone);

    // 3. Close payment modal & open receipt
    onPaymentSuccess();
  };

  const cashChange = Math.max(0, cashReceived - cartTotal);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-ios-red text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Complete Payment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Amount Locked: <strong className="text-ios-red font-black">₹{cartTotal}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                method === 'UPI'
                  ? 'bg-ios-red text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>UPI QR (Auto)</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('CASH')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                method === 'CASH'
                  ? 'bg-ios-red text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('CARD')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                method === 'CARD'
                  ? 'bg-ios-red text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card / POS</span>
            </button>
          </div>

          {/* UPI DYNAMIC QR VIEW (PRIMARY FEATURE B) */}
          {method === 'UPI' && (
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center space-y-4">
              
              {/* Dynamic QR Display */}
              <div className="relative inline-block bg-white p-3.5 rounded-2xl shadow-md border-2 border-slate-200">
                {upiQrUrl ? (
                  <img
                    src={upiQrUrl}
                    alt="Amount-filled UPI QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                )}

                {/* Amount Tag Overlay */}
                <div className="absolute -bottom-3 inset-x-4 bg-slate-950 text-white font-mono font-black text-xs sm:text-sm py-1 rounded-full shadow-md flex items-center justify-center gap-1">
                  <span>Pay: ₹{cartTotal}.00</span>
                </div>
              </div>

              {/* Explanatory notes */}
              <div className="space-y-1 pt-1">
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Amount Pre-filled Automatically in Customer's App</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Scan using Google Pay, PhonePe, Paytm, or any UPI App to pay exact <strong>₹{cartTotal}</strong>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  UPI VPA: {settings.upiId} • Expiring in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Instant Simulator / Payment Confirm Button */}
              <button
                type="button"
                onClick={() => handleFinalCheckout('UPI')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Payment Received (₹{cartTotal}) — Print Bill</span>
              </button>

            </div>
          )}

          {/* CASH VIEW */}
          {method === 'CASH' && (
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Bill Total</span>
                <span className="text-xl font-black text-slate-900 font-mono">₹{cartTotal}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cash Received from Customer (₹)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red font-mono"
                />
              </div>

              {/* Quick Cash Tender Buttons */}
              <div className="flex flex-wrap gap-2">
                {[cartTotal, 100, 200, 500, 1000, 2000].map((amt) => {
                  if (amt < cartTotal && amt !== cartTotal) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        cashReceived === amt
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {amt === cartTotal ? 'Exact' : `₹${amt}`}
                    </button>
                  );
                })}
              </div>

              {/* Return Change calculation */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Change to Return</span>
                  <span className="text-[10px] text-slate-400">Customer Balance</span>
                </div>
                <span className={`text-2xl font-black font-mono ${cashChange > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  ₹{cashChange}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleFinalCheckout('CASH')}
                className="w-full py-3.5 bg-ios-red hover:bg-ios-redHover text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cash Collected — Print Receipt</span>
              </button>
            </div>
          )}

          {/* CARD VIEW */}
          {method === 'CARD' && (
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Swipe or Tap Card on EDC Machine</h4>
                <p className="text-xs text-slate-500">Collect <strong>₹{cartTotal}</strong> on external bank POS machine</p>
              </div>

              <button
                type="button"
                onClick={() => handleFinalCheckout('CARD')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Card Approved — Complete Sale</span>
              </button>
            </div>
          )}

          {/* Optional Customer Contact info */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Customer Details (Optional for WhatsApp Bill):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-ios-red"
                />
              </div>

              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Mobile (WhatsApp)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-ios-red"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
