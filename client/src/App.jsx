import React, { useState } from 'react';
import Sidebar from './common/components/Sidebar';
import SalesPage from './modules/Sales/pages/SalesPage';
import CRMPage from './modules/CRM/pages/CRMPage';
import InventoryPage from './modules/Inventory/pages/InventoryPage';
import SettingsPage from './modules/Settings/pages/SettingsPage';

function App() {
  const [activeView, setActiveView] = useState('sales');

  const renderView = () => {
    switch (activeView) {
      case 'sales':
        return <SalesPage />;
      case 'crm':
        return <CRMPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div className="p-8"><h1 className="text-2xl font-bold">Welcome to SaleSync</h1></div>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto pl-72">
        <header className="h-20 glass-card mx-6 my-4 flex items-center px-8 justify-between">
           <div className="font-semibold text-lg">SaleSync Pro</div>
           <div className="flex items-center gap-4">
              <span className="text-slate-gray text-sm">{new Date().toLocaleDateString()}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-premium"></div>
           </div>
        </header>
        {renderView()}
      </main>
    </div>
  );
}

export default App;
