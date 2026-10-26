import React, { useState, useEffect } from 'react';
import type { Bill } from '../../types/pos';
import { usePOS } from '../../context/POSContext';
import { generateQrDataUrl, createBillVerificationPayload } from '../../utils/qr';
import { Printer, Share2, CheckCircle2, X, PlusCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  bill: Bill | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ bill, onClose }) => {
  const { settings } = usePOS();
  const [verifyQrUrl, setVerifyQrUrl] = useState<string>('');

  useEffect(() => {
    if (!bill) return;

    const payload = createBillVerificationPayload(bill);
    generateQrDataUrl(payload, '#000000').then((url) => {
      setVerifyQrUrl(url);
    });
  }, [bill]);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, '') : '';
    const itemsList = bill.items
      .map((item) => `• ${item.product.name} (x${item.quantity}) = ₹${item.product.price * item.quantity}`)
      .join('\n');

    const msg = encodeURIComponent(
      `🧾 *${settings.storeName} — Invoice #${bill.billNumber}*\n` +
      `📅 Date: ${new Date(bill.timestamp).toLocaleString('en-IN')}\n\n` +
      `*Items Purchased:*\n${itemsList}\n\n` +
      `• *Subtotal*: ₹${bill.subtotal}\n` +
      (bill.discountAmount > 0 ? `• *Discount*: -₹${bill.discountAmount} (${bill.discountPercent}%)\n` : '') +
      `• *Grand Total*: ₹${bill.finalTotal}\n` +
      `• *Payment*: ${bill.paymentMethod} (${bill.paymentStatus})\n\n` +
      `🔒 *Verification Code*: ${bill.verificationHash}\n\n` +
      `Thank you for shopping with us!`
    );

    const waUrl = phone
      ? `https://wa.me/91${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(waUrl, '_blank');
  };

  const formattedDate = new Date(bill.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* RECEIPT PREVIEW (Also targeted by print stylesheet) */}
        <div id="thermal-receipt" className="p-5 font-mono text-xs text-slate-800 space-y-4 max-h-[65vh] overflow-y-auto bg-white">
          
          {/* Store Info Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-sans font-black text-lg text-slate-900 tracking-tight">
              {settings.storeName}
            </h2>
            <p className="text-[11px] text-slate-600 leading-tight">
              {settings.address}
            </p>
            <p className="text-[11px] text-slate-600">
              Tel: {settings.phone} {settings.gstin && `| GSTIN: ${settings.gstin}`}
            </p>
          </div>

          {/* Meta Information */}
          <div className="text-[11px] space-y-0.5 text-slate-600 pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>Invoice: <strong>{bill.billNumber}</strong></span>
              <span>Date: {formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer: {bill.customerName}</span>
              <span>Cashier: {bill.cashierName}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <div className="grid grid-cols-12 font-bold text-[11px] text-slate-900 border-b border-slate-900 pb-1 mb-1.5">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-2 text-right">RATE</span>
              <span className="col-span-2 text-right">TOTAL</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {bill.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 leading-tight">
                  <span className="col-span-6 truncate font-medium text-slate-900">
                    {item.product.name}
                  </span>
                  <span className="col-span-2 text-center text-slate-600">
                    {item.quantity}
                  </span>
                  <span className="col-span-2 text-right text-slate-600">
                    ₹{item.product.price}
                  </span>
                  <span className="col-span-2 text-right font-bold text-slate-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span>₹{bill.subtotal}</span>
            </div>

            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>
                  Discount ({bill.discountPercent}%
                  {bill.isOwnerDiscountApproved ? ' - Owner Approved' : ''}):
                </span>
                <span>-₹{bill.discountAmount}</span>
              </div>
            )}

            {settings.enableGst && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (Included):</span>
                <span>₹{bill.gstAmount}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-950 font-sans">
              <span>GRAND TOTAL:</span>
              <span>₹{bill.finalTotal}.00</span>
            </div>

            <div className="flex justify-between text-[11px] text-emerald-700 font-bold pt-1">
              <span>Payment Mode:</span>
              <span>{bill.paymentMethod} — {bill.paymentStatus}</span>
            </div>
          </div>

          {/* BILL VERIFICATION QR (FEATURE C - THE KEY DIFFERENTIATOR) */}
          <div className="pt-3 border-t border-dashed border-slate-300 text-center space-y-1.5">
            <div className="inline-block bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
              {verifyQrUrl && (
                <img
                  src={verifyQrUrl}
                  alt="Bill Verification QR"
                  className="w-28 h-28 mx-auto object-contain"
                />
              )}
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bill Verification QR</span>
              </span>
              <p className="text-[9px] text-slate-500 leading-tight">
                Scan with SmartBill app at security gate to verify genuine paid receipt
              </p>
              <p className="text-[9px] font-mono text-slate-400">
                Security Hash: {bill.verificationHash}
              </p>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
            <p>{settings.receiptFooter}</p>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-3 bg-ios-red hover:bg-ios-redHover text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>

      </div>
    </div>
  );
};
