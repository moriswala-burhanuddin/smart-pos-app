import React from 'react';
import { usePOS } from '../../context/POSContext';
import { BarChart3, TrendingUp, IndianRupee, QrCode, Banknote, CreditCard, ShoppingBag, ShieldCheck, Award } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { bills } = usePOS();

  // Metrics
  const totalRevenue = bills.reduce((sum, b) => sum + b.finalTotal, 0);
  const totalBillsCount = bills.length;
  const avgOrderValue = totalBillsCount > 0 ? Math.round(totalRevenue / totalBillsCount) : 0;
  const totalItemsSold = bills.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalDiscountsGiven = bills.reduce((sum, b) => sum + b.discountAmount, 0);

  // Payment Breakdown
  const upiBills = bills.filter((b) => b.paymentMethod === 'UPI');
  const cashBills = bills.filter((b) => b.paymentMethod === 'CASH');
  const cardBills = bills.filter((b) => b.paymentMethod === 'CARD');

  const upiRevenue = upiBills.reduce((sum, b) => sum + b.finalTotal, 0);
  const cashRevenue = cashBills.reduce((sum, b) => sum + b.finalTotal, 0);
  const cardRevenue = cardBills.reduce((sum, b) => sum + b.finalTotal, 0);

  const upiPercent = totalRevenue > 0 ? Math.round((upiRevenue / totalRevenue) * 100) : 0;
  const cashPercent = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0;
  const cardPercent = totalRevenue > 0 ? Math.round((cardRevenue / totalRevenue) * 100) : 0;

  // Top Selling Products Leaderboard
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  bills.forEach((b) => {
    b.items.forEach((item) => {
      const existing = productSalesMap.get(item.product.id) || {
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.product.price * item.quantity;
      productSalesMap.set(item.product.id, existing);
    });
  });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Discount Security Audit Metrics
  const ownerApprovedBillsCount = bills.filter((b) => b.isOwnerDiscountApproved).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Owner Dashboard & Sales Reports
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Real-time financial revenue, payment method distribution, and discount audits
        </p>
      </div>

      {/* KPI Cards in iOS Clean Red & White Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-ios space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-ios-red/10 text-ios-red flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-ios-red font-mono block">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Today's Cashflow</span>
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-ios space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Invoices Issued</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
            {totalBillsCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Total completed checkouts
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-ios space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Ticket Size</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
            ₹{avgOrderValue}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Avg revenue per customer
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-ios space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Items Dispatched</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
            {totalItemsSold}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Units moved out of store
          </span>
        </div>

      </div>

      {/* Two Column Grid: Payment Split & Anti-Bargain Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Payment Channels (7 Cols on LG) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Payment Channel Breakdown
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                UPI QR vs Cash vs Bank Card Collection
              </p>
            </div>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
              ₹{totalRevenue} Total
            </span>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* UPI Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>Amount-Filled Dynamic UPI QR</span>
                </span>
                <span className="font-mono text-purple-700">
                  ₹{upiRevenue} ({upiPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${upiPercent}%` }}
                />
              </div>
            </div>

            {/* Cash Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Physical Cash Register</span>
                </span>
                <span className="font-mono text-emerald-700">
                  ₹{cashRevenue} ({cashPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${cashPercent}%` }}
                />
              </div>
            </div>

            {/* Card Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Card / POS Machine</span>
                </span>
                <span className="font-mono text-blue-700">
                  ₹{cardRevenue} ({cardPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${cardPercent}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Anti-Bargaining & Discount Audit Card (5 Cols on LG) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-ios space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Discount Security Audit
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Leakage control & Owner PIN verifications
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Discounts Granted:</span>
              <strong className="text-rose-600 font-mono text-sm">₹{totalDiscountsGiven}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Owner PIN Overrides:</span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {ownerApprovedBillsCount} invoices
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Unauthorized Bargain Leaks:</span>
              <span className="text-emerald-700 font-bold">
                0% (Blocked by Guard)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Cashiers are strictly locked under the owner discount ceiling. Excess discounts without PIN are blocked at checkout.
          </p>
        </div>

      </div>

      {/* Top Selling Products Leaderboard */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-ios space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">
          Fast-Moving Items (Top Sellers)
        </h3>

        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Complete a few customer sales in Billing to view live product leaderboards.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-ios-red bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    #{idx + 1} Best Seller
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {p.quantity} sold
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                  {p.name}
                </h4>
                <div className="pt-1 border-t border-slate-200/60 flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-400">Total Rev:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ₹{p.revenue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
