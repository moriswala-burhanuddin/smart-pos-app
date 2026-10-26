import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ShoppingBag, Plus, Minus, Trash2, Tag, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  onProceedToPay: () => void;
  onRequireOwnerPin: (pendingDiscount: number) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  onProceedToPay,
  onRequireOwnerPin,
}) => {
  const {
    cart,
    updateCartItemQty,
    clearCart,
    cartSubtotal,
    cartGstAmount,
    discountPercent,
    discountAmount,
    cartTotal,
    isOwnerApproved,
    setDiscount,
    settings,
  } = usePOS();

  const handleDiscountSelect = (pct: number) => {
    const res = setDiscount(pct);
    if (res.requiresPin) {
      onRequireOwnerPin(pct);
    }
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-ios-lg p-4 sm:p-5 flex flex-col h-full justify-between">
      
      {/* Cart Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ios-red/10 text-ios-red flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Current Bill
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="overflow-y-auto max-h-[38vh] lg:max-h-[34vh] space-y-2.5 pr-1">
          {cart.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500">Cart is empty</p>
              <p className="text-[11px] text-slate-400">Scan barcodes or tap products to start billing</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-2.5 border border-slate-200/60 flex items-center justify-between gap-2 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs text-slate-900 truncate leading-snug">
                    {item.product.name}
                  </h5>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{item.product.price}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      × {item.quantity} = ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                </div>

                {/* iOS Stepper Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-500" /> : <Minus className="w-3 h-3" />}
                  </button>

                  <span className="w-6 text-center text-xs font-black text-slate-900 font-mono">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill Summary, Discount Guard, and Checkout */}
      <div className="pt-3 border-t border-slate-100 space-y-3 mt-2">
        
        {/* Discount Protection Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-ios-red" />
              <span>Bill Discount</span>
            </span>

            {isOwnerApproved ? (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Owner Approved</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">
                Max {settings.maxCashierDiscountPercent}% without PIN
              </span>
            )}
          </div>

          {/* Quick Discount Pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 2, 5, 10, 15].map((pct) => {
              const isSelected = discountPercent === pct;
              const isAboveLimit = pct > settings.maxCashierDiscountPercent && !isOwnerApproved;

              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDiscountSelect(pct)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    isSelected
                      ? 'bg-ios-red text-white shadow-sm'
                      : isAboveLimit
                      ? 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-dashed border-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  <span>{pct === 0 ? 'None' : `${pct}%`}</span>
                  {isAboveLimit && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>

          {discountPercent > settings.maxCashierDiscountPercent && !isOwnerApproved && (
            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Requires 4-digit Owner PIN to apply {discountPercent}% discount</span>
            </p>
          )}
        </div>

        {/* Calculation Rows */}
        <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-slate-900 font-bold">₹{cartSubtotal}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-mono font-bold">-₹{discountAmount}</span>
            </div>
          )}

          {settings.enableGst && (
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Estimated GST (Included/Itemized)</span>
              <span className="font-mono font-bold">₹{cartGstAmount}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                Net Payable
              </span>
              <span className="text-[10px] text-slate-400 font-medium">All taxes included</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-ios-red font-mono">
              ₹{cartTotal}
            </span>
          </div>
        </div>

        {/* Big Red "Charge & Generate UPI QR" Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={onProceedToPay}
          className="w-full py-3.5 sm:py-4 bg-ios-red hover:bg-ios-redHover disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Pay & Generate QR (₹{cartTotal})</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

      </div>

    </div>
  );
};
