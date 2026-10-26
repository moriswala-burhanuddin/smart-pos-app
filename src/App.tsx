import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/common/Header';
import { TabBar } from './components/common/TabBar';
import { BillingView } from './components/billing/BillingView';
import { InventoryView } from './components/inventory/InventoryView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

const POSMainApp: React.FC = () => {
  const { activeTab } = usePOS();

  return (
    <div className="min-h-screen bg-ios-bg text-slate-900 flex flex-col font-sans selection:bg-ios-red selection:text-white pb-14 sm:pb-16">
      {/* iOS Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'billing' && <BillingView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* iOS Floating Bottom Tab Bar */}
      <TabBar />
    </div>
  );
};

export function App() {
  return (
    <POSProvider>
      <POSMainApp />
    </POSProvider>
  );
}

export default App;
