import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Store, QrCode, Shield, FileText, CheckCircle2, RotateCcw, Lock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = usePOS();
  
  const [form, setForm] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all bills, inventory, and restore default demo products?')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Store & POS Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Configure UPI payment QR credentials, Owner discount PIN, and store invoice details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Store Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-5 h-5 text-ios-red" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Store Profile & Invoice Header
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store / Business Name</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tagline / Short Description</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Full Address (Printed on bill)</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Amount-Filled UPI Configuration */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <QrCode className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Dynamic Amount-Filled UPI QR Setup
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Payments made via QR directly reach this UPI VPA account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                UPI VPA ID (e.g. shopname@upi or mobile@paytm)
              </label>
              <input
                type="text"
                required
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Merchant / Business Name (shown in GPay/PhonePe)
              </label>
              <input
                type="text"
                required
                value={form.upiMerchantName}
                onChange={(e) => setForm({ ...form, upiMerchantName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Anti-Bargaining & Owner Discount Security Guard */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Anti-Bargain & Cashier Discount Lock
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Prevent employee discount leaks and unauthorized bargaining
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Max Allowed Cashier Discount (%) without PIN
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={form.maxCashierDiscountPercent}
                onChange={(e) => setForm({ ...form, maxCashierDiscountPercent: Number(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
              />
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Cashiers can only give up to this percentage. Above this, Owner PIN is enforced.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Owner Security PIN (4 Digits)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={form.ownerPin}
                  onChange={(e) => setForm({ ...form, ownerPin: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Default demo PIN is <strong>1234</strong>. Keep it confidential.
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Customization */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Thermal Receipt Footer Note
            </h3>
          </div>

          <div>
            <textarea
              rows={2}
              value={form.receiptFooter}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-ios-red"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.enableGst}
              onChange={(e) => setForm({ ...form, enableGst: e.target.checked })}
              className="w-4 h-4 text-ios-red rounded focus:ring-ios-red accent-red-600"
            />
            <span>Enable Itemized GST Calculation on Invoices</span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-3 rounded-2xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data to Default</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ios-red hover:bg-ios-redHover text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center animate-in fade-in">
            Store settings updated successfully!
          </div>
        )}

      </form>
    </div>
  );
};
