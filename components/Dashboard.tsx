
import React from 'react';
import { Lead, LeadStatus, Profile } from '../types';
import { isToday, isOverdue, formatDate, getTrialDaysLeft, isTrialActive, isPaidActive, formatIndianCompact } from '../utils';

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

  const trialActive = isTrialActive(profile?.created_at);
  const paidActive = isPaidActive(profile?.subscription?.paid_until);
  const trialDaysLeft = getTrialDaysLeft(profile?.created_at);

  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* STATUS BANNER */}
      {!paidActive && (
        <div className={`mb-8 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 shadow-sm ${!trialActive ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${!trialActive ? 'bg-red-200' : 'bg-blue-200'}`}>!</div>
            <p className="text-sm font-bold uppercase tracking-widest text-center md:text-left leading-relaxed">
              {!trialActive ? 'Your free trial has ended.' : `${trialDaysLeft} days remaining in your free trial.`}
            </p>
          </div>
          {!trialActive && <span className="text-xs font-black underline cursor-pointer hover:text-red-700">Upgrade to Pro (₹499)</span>}
        </div>
      )}

      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Today's Focus</h2>
        <div className="mt-2">
          {totalNeedsAttention === 0 ? (
            <p className="text-gray-600 font-bold italic text-base">Clear schedule today. Go find more leads.</p>
          ) : (
            <p className="text-base text-gray-700 font-medium">
              You have <span className="text-blue-700 font-black border-b-2 border-blue-200">{totalNeedsAttention} tasks</span> to clear before EOD.
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Active</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{activeLeads.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest">Pipeline</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹{formatIndianCompact(pipelineValue)}</p>
        </div>
        <div className={`bg-white p-6 rounded-3xl border shadow-sm ${overdueFollowUps.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${overdueFollowUps.length > 0 ? 'text-red-700' : 'text-gray-600'}`}>Overdue</p>
          <p className={`text-2xl font-black mt-2 ${overdueFollowUps.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>{overdueFollowUps.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm border-b-4 border-b-blue-600">
          <p className="text-[11px] text-blue-700 font-bold uppercase tracking-widest">Due Today</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{todayUpcomingFollowUps.length}</p>
        </div>
      </div>

      <div className="space-y-10">
        {overdueFollowUps.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-red-700 uppercase tracking-[0.2em] mb-5 px-1">Urgent Attention</h3>
            <div className="space-y-4">
              {overdueFollowUps.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:border-red-400 border-2 border-red-200 rounded-[2rem] transition-all text-left shadow-md shadow-red-100/50 gap-4 group"
                >
                  <div>
                    <p className="font-black text-gray-900 text-xl group-hover:text-red-700 transition-colors">{lead.fullName}</p>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-1">Missed: {formatDate(getNextFollowUp(lead)!.date).split(',')[0]}</p>
                  </div>
                  <div className="text-white bg-red-700 px-6 py-3 rounded-2xl font-black text-xs text-center uppercase tracking-widest shadow-lg shadow-red-200">CALL NOW</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-[0.2em] mb-5 px-1">Scheduled Today</h3>
          {todayUpcomingFollowUps.length > 0 ? (
            <div className="space-y-4">
              {todayUpcomingFollowUps.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:border-blue-400 border border-gray-200 rounded-[2rem] transition-all text-left shadow-sm group"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{lead.fullName}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      <span className="text-blue-700 font-black uppercase tracking-tighter">{getNextFollowUp(lead)?.type}</span> at {new Date(getNextFollowUp(lead)!.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-200/50 rounded-[2.5rem] border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-bold italic text-base">No tasks remaining for today.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
