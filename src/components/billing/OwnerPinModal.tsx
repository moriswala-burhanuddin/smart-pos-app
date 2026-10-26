import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ShieldAlert, Delete, X, Sparkles } from 'lucide-react';

interface OwnerPinModalProps {
  isOpen: boolean;
  requestedDiscount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  requestedDiscount,
  onSuccess,
  onClose,
}) => {
  const { verifyAndApproveOwnerPin, settings } = usePOS();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Auto-check 4-digit PIN
        setTimeout(() => {
          const isValid = verifyAndApproveOwnerPin(nextPin);
          if (isValid) {
            setPin('');
            onSuccess();
          } else {
            setErrorMsg('Invalid Owner PIN! Access Denied.');
            setIsShaking(true);
            setTimeout(() => {
              setIsShaking(false);
              setPin('');
            }, 600);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleQuickDemoFill = () => {
    setPin(settings.ownerPin);
    const isValid = verifyAndApproveOwnerPin(settings.ownerPin);
    if (isValid) {
      setTimeout(() => {
        setPin('');
        onSuccess();
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-center p-6 space-y-5">
        
        {/* Top Close */}
        <div className="flex justify-between items-center -mt-1 -mr-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Security Guard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Shield Icon & Heading */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-ios-red/10 text-ios-red mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-black text-xl text-slate-900 tracking-tight">
            Owner PIN Required
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            Cashiers are capped at <strong>{settings.maxCashierDiscountPercent}%</strong> discount. 
            Enter Store Owner PIN to authorize <strong>{requestedDiscount}%</strong> discount.
          </p>
        </div>

        {/* 4 PIN Dots (iOS Passcode Style) */}
        <div className={`flex justify-center items-center gap-4 py-2 ${isShaking ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-ios-red scale-110 shadow-sm'
                    : 'border-2 border-slate-300 bg-slate-50'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 py-1 px-3 rounded-lg border border-rose-200 inline-block">
            {errorMsg}
          </p>
        )}

        {/* iOS Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-ios-red active:text-white text-slate-900 font-bold text-xl shadow-xs transition-colors flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}

          {/* Quick Demo PIN Helper */}
          <button
            type="button"
            onClick={handleQuickDemoFill}
            title="Auto-fill Demo Owner PIN (1234)"
            className="w-16 h-16 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center mx-auto transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
            <span>PIN: {settings.ownerPin}</span>
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-ios-red active:text-white text-slate-900 font-bold text-xl shadow-xs transition-colors flex items-center justify-center mx-auto"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-rose-100 text-slate-600 flex items-center justify-center mx-auto transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footnote */}
        <div className="pt-2">
          <p className="text-[11px] text-slate-400 font-medium">
            Owner PIN can be customized anytime in Settings (Default: <strong>{settings.ownerPin}</strong>)
          </p>
        </div>

      </div>
    </div>
  );
};
