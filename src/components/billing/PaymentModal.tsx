import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import type { PaymentMethod } from '../../types/pos';
import { buildUpiPaymentUrl, generateQrDataUrl } from '../../utils/qr';
import { QrCode, Banknote, CreditCard, X, CheckCircle2, User, Phone, ShieldCheck, RefreshCw, Wifi, Radio, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playScanBeep } from '../../utils/audio';

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

  // Auto-detect & Card Tapping state
  const [isAutoDetecting, setIsAutoDetecting] = useState<boolean>(false);
  const [autoDetectCountdown, setAutoDetectCountdown] = useState<number>(3);
  const [isCardTapping, setIsCardTapping] = useState<boolean>(false);

  // Generate dynamic amount-filled UPI QR whenever opened or amount changes
  useEffect(() => {
    if (!isOpen) {
      setIsAutoDetecting(false);
      setIsCardTapping(false);
      return;
    }

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

  // Handle auto-detect simulation timer
  useEffect(() => {
    if (!isAutoDetecting) return;
    if (autoDetectCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoDetectCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto payment arrival triggered!
      setIsAutoDetecting(false);
      handleFinalCheckout('UPI');
    }
  }, [isAutoDetecting, autoDetectCountdown]);

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

  // Card contactless tap simulator
  const handleSimulateCardTap = () => {
    setIsCardTapping(true);
    playScanBeep();
    setTimeout(() => {
      handleFinalCheckout('CARD');
    }, 1200);
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
              <span>UPI QR</span>
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
              <span>Tap / Card</span>
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
                  Scan using Google Pay, PhonePe, Paytm, or BHIM to pay exact <strong>₹{cartTotal}</strong>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  UPI VPA: {settings.upiId} • Expiring in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>

              {/* Live Webhook / Auto-Detect Simulator */}
              {isAutoDetecting ? (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs font-bold space-y-1 animate-pulse">
                  <div className="flex items-center justify-center gap-1.5">
                    <Radio className="w-4 h-4 text-purple-600 animate-spin" />
                    <span>Listening to Bank Webhook / Soundbox...</span>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    Payment arriving in {autoDetectCountdown}s ➔ Auto-printing invoice!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoDetecting(true);
                      setAutoDetectCountdown(3);
                    }}
                    className="py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Detect Demo (3s)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalCheckout('UPI')}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Confirm Received</span>
                  </button>
                </div>
              )}

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

          {/* CARD CONTACTLESS NFC TAP / CHIP SCAN VIEW */}
          {method === 'CARD' && (
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center space-y-4">
              
              {/* Contactless Visual */}
              <div className="relative w-44 h-28 mx-auto bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-3 text-white flex flex-col justify-between shadow-md border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-5 bg-amber-400/80 rounded-sm" /> {/* Chip */}
                  <Wifi className="w-4 h-4 text-slate-300 rotate-90" /> {/* Contactless Icon */}
                </div>
                <div className="text-left font-mono text-xs tracking-widest text-slate-400">
                  •••• •••• •••• 8820
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span>CONTACTLESS NFC</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Fast Contactless Tap & Swipe (Zero Details Needed)
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mt-0.5">
                  Customer taps debit/credit card or smartwatch on counter reader. No card numbers or OTP required.
                </p>
              </div>

              {isCardTapping ? (
                <div className="py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>NFC Chip Read Successful! Authorizing ₹{cartTotal}...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateCardTap}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Wifi className="w-4 h-4 rotate-90" />
                  <span>Tap Card on Reader (Auto Approve)</span>
                </button>
              )}

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
