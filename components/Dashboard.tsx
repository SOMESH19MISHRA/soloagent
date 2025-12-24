
import React from 'react';
import { Lead, LeadStatus, Profile } from '../types';
import { isToday, isOverdue, formatDate, getTrialDaysLeft, isTrialExpired } from '../utils';

interface DashboardProps {
  leads: Lead[];
  profile: Profile | null;
  onNavigateToLead: (id: string) => void;
  onViewLeads: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, profile, onNavigateToLead, onViewLeads }) => {
  const getNextFollowUp = (lead: Lead) => lead.followUps.find(f => !f.completed);

  const overdueFollowUps = leads.filter(lead => {
    const next = getNextFollowUp(lead);
    return next && isOverdue(next.date);
  });

  const todayUpcomingFollowUps = leads.filter(lead => {
    const next = getNextFollowUp(lead);
    return next && isToday(next.date) && !isOverdue(next.date);
  });

  const activeLeads = leads.filter(l => l.status !== LeadStatus.Closed && l.status !== LeadStatus.Lost);
  
  const totalNeedsAttention = todayUpcomingFollowUps.length + overdueFollowUps.length;
  const trialDaysLeft = getTrialDaysLeft(profile?.created_at);
  const trialExpired = isTrialExpired(profile?.created_at);

  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* TRIAL BANNER */}
      {!profile?.is_active && (
        <div className={`mb-6 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 border ${trialExpired ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-xs ${trialExpired ? 'bg-red-200' : 'bg-blue-200'}`}>!</div>
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-center md:text-left">
              {trialExpired ? 'Free Trial Ended' : `${trialDaysLeft} Days left in your free trial`}
            </p>
          </div>
          {trialExpired && <span className="text-[10px] font-black underline cursor-pointer">Upgrade Now</span>}
        </div>
      )}

      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Today's Focus</h2>
        <div className="mt-1">
          {totalNeedsAttention === 0 ? (
            <p className="text-gray-400 font-bold italic text-sm">Clear schedule today. Go find more leads.</p>
          ) : (
            <p className="text-sm text-gray-600 font-medium">
              You have <span className="text-blue-600 font-bold underline">{totalNeedsAttention}</span> tasks to clear.
            </p>
          )}
        </div>
      </header>

      {/* Responsive Grid for Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest">Active</p>
          <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{activeLeads.length}</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-emerald-100 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest">Pipeline</p>
          <p className="text-xl md:text-2xl font-black text-gray-900 mt-0.5">₹{(pipelineValue / 100000).toFixed(1)}L</p>
        </div>
        <div className={`bg-white p-4 md:p-5 rounded-2xl border ${overdueFollowUps.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${overdueFollowUps.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>Overdue</p>
          <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{overdueFollowUps.length}</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm border-b-4 border-b-blue-600">
          <p className="text-[9px] md:text-[10px] text-blue-600 font-black uppercase tracking-widest">Due Today</p>
          <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{todayUpcomingFollowUps.length}</p>
        </div>
      </div>

      <div className="space-y-8">
        {overdueFollowUps.length > 0 && (
          <section>
            <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Urgent Attention</h3>
            <div className="space-y-3">
              {overdueFollowUps.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white hover:border-red-400 border-2 border-red-100 rounded-2xl transition-all text-left shadow-lg shadow-red-50/50 gap-4"
                >
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg">{lead.fullName}</p>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">Missed: {formatDate(getNextFollowUp(lead)!.date).split(',')[0]}</p>
                  </div>
                  <div className="text-white bg-red-600 px-4 py-2 rounded-xl font-bold text-xs text-center">CALL NOW</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Upcoming Contacts</h3>
          {todayUpcomingFollowUps.length > 0 ? (
            <div className="space-y-3">
              {todayUpcomingFollowUps.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:border-blue-300 border border-gray-200 rounded-2xl transition-all text-left shadow-sm group"
                >
                  <div>
                    <p className="font-bold text-gray-900">{lead.fullName}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      <span className="text-blue-600 font-bold">{getNextFollowUp(lead)?.type}</span> at {new Date(getNextFollowUp(lead)!.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic text-sm">No tasks remaining for today.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
