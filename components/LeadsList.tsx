
import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { formatDate, isOverdue } from '../utils';

interface LeadsListProps {
  leads: Lead[];
  onNavigateToLead: (id: string) => void;
  onAddClick: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, onNavigateToLead, onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'All'>('All');

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.New: return 'bg-blue-100 text-blue-700';
      case LeadStatus.Closed: return 'bg-green-100 text-green-700';
      case LeadStatus.Lost: return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">Prospect Pipeline</h2>
          <p className="text-gray-500 font-medium mt-1 text-sm">Track every detail. Close every deal.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 md:py-3 rounded-2xl md:rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-200 w-full md:w-auto"
        >
          + ADD NEW LEAD
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative">
          <input 
            type="text"
            placeholder="Search leads..."
            className="w-full bg-white border border-gray-200 rounded-2xl md:rounded-xl px-5 py-4 md:py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <button 
            onClick={() => setFilterStatus('All')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterStatus === 'All' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
          >
            All
          </button>
          {Object.values(LeadStatus).map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterStatus === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stage</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Economics</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Next Step</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => {
                const next = lead.followUps.find(f => !f.completed);
                const overdue = next && isOverdue(next.date);

                return (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    onClick={() => onNavigateToLead(lead.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{lead.fullName}</div>
                      <div className="text-xs text-gray-400 font-medium">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-800">₹{lead.budget.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lead.area}</div>
                    </td>
                    <td className="px-6 py-5">
                      {next ? (
                        <div className={`flex items-center gap-2 text-sm font-bold ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {overdue && <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>}
                          {formatDate(next.date)}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black">
                          ⚠️ NO ACTION
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {filteredLeads.length > 0 ? filteredLeads.map(lead => {
          const next = lead.followUps.find(f => !f.completed);
          const overdue = next && isOverdue(next.date);

          return (
            <div 
              key={lead.id} 
              onClick={() => onNavigateToLead(lead.id)}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{lead.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">₹{lead.budget.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lead.area}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Follow-up</p>
                  {next ? (
                    <p className={`text-xs font-bold ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatDate(next.date).split(',')[0]} at {new Date(next.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  ) : (
                    <p className="text-xs font-black text-red-500 uppercase">⚠️ Set Action</p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 px-6">
            <p className="text-gray-400 font-bold">No leads found in this stage.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;
