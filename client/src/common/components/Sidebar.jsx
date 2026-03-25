
import React from 'react';
import { ShoppingCart, Users, Package, Settings, LogOut, ChartNoAxesColumn, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'sales', label: 'Sales Terminal', icon: <ShoppingCart size={20} />, color: 'text-blue-500' },
    { id: 'crm', label: 'CRM Directory', icon: <Users size={20} />, color: 'text-purple-500' },
    { id: 'inventory', label: 'Inventory Hub', icon: <Package size={20} />, color: 'text-orange-500' },
    { id: 'settings', label: 'System Settings', icon: <Settings size={20} />, color: 'text-slate-500' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 z-50 flex flex-col p-6 shadow-2xl shadow-slate-200/20 dark:shadow-black/20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <Zap size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">SaleSync</h1>
          <div className="text-[10px] font-black text-primary tracking-widest uppercase opacity-80">Enterprise Pro</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
              activeView === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className={activeView === item.id ? 'text-white' : item.color}>
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
            
            {activeView === item.id && (
              <motion.div 
                layoutId="activePill"
                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <ChartNoAxesColumn size={14} className="text-green-500" />
            <span className="text-[10px] uppercase font-black text-slate-400">Live Analytics</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            System performance is <span className="text-green-500 font-bold">Optimal</span>.
          </div>
        </div>

        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-sm">
          <LogOut size={20} />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
