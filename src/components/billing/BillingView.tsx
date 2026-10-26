import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { CartSidebar } from './CartSidebar';
import { ScannerModal } from './ScannerModal';
import { PaymentModal } from './PaymentModal';
import { OwnerPinModal } from './OwnerPinModal';
import { ReceiptModal } from './ReceiptModal';
import { usePOS } from '../../context/POSContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const BillingView: React.FC = () => {
  const { cart, cartTotal, activeBill, setActiveBill, setDiscount } = usePOS();
  
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [ownerPinOpen, setOwnerPinOpen] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState<number>(0);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleRequireOwnerPin = (discount: number) => {
    setPendingDiscount(discount);
    setOwnerPinOpen(true);
  };

  const handleOwnerPinSuccess = () => {
    setOwnerPinOpen(false);
    setDiscount(pendingDiscount);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
      
      {/* Desktop / Tablet Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Product Catalog & Search (7 Cols on LG) */}
        <div className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-140px)]">
          <ProductGrid onOpenScanner={() => setScannerOpen(true)} />
        </div>

        {/* Right Column: Desktop Cart Sidebar (5 Cols on LG) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20 h-[calc(100vh-140px)]">
          <CartSidebar
            onProceedToPay={() => setPaymentOpen(true)}
            onRequireOwnerPin={handleRequireOwnerPin}
          />
        </div>

      </div>

      {/* Mobile Floating Bottom Cart Bar */}
      {totalCartCount > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-16 inset-x-3 z-30 animate-in fade-in slide-in-from-bottom-4">
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="w-full bg-slate-950 text-white p-3.5 rounded-2xl shadow-ios-lg border border-white/20 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ios-red text-white flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-300 block">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-base font-black text-white font-mono leading-none">
                  ₹{cartTotal}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ios-red bg-white px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Cart Sheet / Modal */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] max-h-[85vh] p-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-2 pb-1">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-1 mb-2" />
            </div>
            
            <div className="overflow-y-auto flex-1 pb-4">
              <CartSidebar
                onProceedToPay={() => {
                  setMobileCartOpen(false);
                  setPaymentOpen(true);
                }}
                onRequireOwnerPin={(discount) => {
                  setMobileCartOpen(false);
                  handleRequireOwnerPin(discount);
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileCartOpen(false)}
              className="w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl mt-2"
            >
              Continue Adding Items
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onPaymentSuccess={() => {
          setPaymentOpen(false);
          // Active bill is already set in context by completeSale!
        }}
      />

      <OwnerPinModal
        isOpen={ownerPinOpen}
        requestedDiscount={pendingDiscount}
        onSuccess={handleOwnerPinSuccess}
        onClose={() => setOwnerPinOpen(false)}
      />

      <ReceiptModal
        bill={activeBill}
        onClose={() => setActiveBill(null)}
      />

    </div>
  );
};
