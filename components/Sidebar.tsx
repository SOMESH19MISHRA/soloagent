import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { id: 'leads', label: 'Pipeline', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
    { id: 'profile', label: 'Account', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { id: 'feedback', label: 'Support', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    )},
  ];

  return (
    <aside className="w-24 md:w-72 bg-white border-r border-gray-300 flex flex-col sticky top-0 h-screen shadow-xl z-50">
      <div className="p-6 md:p-10 border-b border-gray-200 flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">S</div>
        <h1 className="hidden md:block font-black text-2xl text-gray-900 tracking-tighter">SoloAgent</h1>
      </div>
      
      <nav className="flex-1 py-8 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              currentView === item.id || (currentView === 'lead-detail' && item.id === 'leads')
                ? 'text-blue-800 bg-blue-100 shadow-inner'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className={`${currentView === item.id ? 'text-blue-800' : 'text-gray-400'}`}>{item.icon}</span>
            <span className="hidden md:block uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <button 
          onClick={() => setView('add-lead')}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-2xl py-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          <span className="hidden md:block text-xs font-black uppercase tracking-[0.2em]">New Lead</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full text-gray-500 hover:text-red-700 rounded-2xl py-3 flex items-center justify-center md:justify-start md:px-5 gap-3 transition-all text-xs font-black uppercase tracking-[0.2em]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;