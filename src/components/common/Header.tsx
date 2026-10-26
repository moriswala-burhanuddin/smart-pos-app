import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Store, ShieldCheck, Clock, Wifi, Lock, RotateCcw } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, cart, clearCart, isOwnerApproved, cancelOwnerApproval } = usePOS();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Store Name */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ios-red text-white flex items-center justify-center shadow-sm shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                {settings.storeName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <Wifi className="w-2.5 h-2.5" />
                <span>POS Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Right Status & Clock */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Owner Discount Status Badge */}
          {isOwnerApproved ? (
            <button
              type="button"
              onClick={cancelOwnerApproval}
              title="Owner discount authorization is active. Click to lock."
              className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Owner Unlocked</span>
              <span className="sm:hidden">Unlocked</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Owner Guard (Max {settings.maxCashierDiscountPercent}%)</span>
            </div>
          )}

          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeStr}</span>
          </div>

          {/* Quick Clear Cart if has items */}
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all items from current cart?')) {
                  clearCart();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Cart</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
