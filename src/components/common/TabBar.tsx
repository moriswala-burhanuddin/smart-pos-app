import React from 'react';
import { usePOS } from '../../context/POSContext';
import type { ActiveTab } from '../../types/pos';
import { ShoppingCart, Package, FileText, BarChart3, Settings } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, cart, products } = usePOS();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    {
      id: 'billing',
      label: 'Billing',
      icon: ShoppingCart,
      badge: totalCartCount > 0 ? totalCartCount : undefined,
      badgeColor: 'bg-ios-red',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'invoices',
      label: 'Bills & Verify',
      icon: FileText,
    },
    {
      id: 'analytics',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-14 sm:h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-ios-red font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-sm ${
                      tab.badgeColor || 'bg-ios-red'
                    }`}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>

              {/* Active Tab Pill Indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-ios-red rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
