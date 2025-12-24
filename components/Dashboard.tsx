
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
  const leadsWithoutAction = activeLeads.filter(l => !getNextFollowUp(l));
  
  const totalNeedsAttention = todayUpcomingFollowUps.length + overdueFollowUps.length;
  const trialDaysLeft = getTrialDaysLeft(profile?.created_at);
  const trialExpired = isTrialExpired(profile?.created_at);

  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* TRIAL BANNER */}
      {!profile?.is_active && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${trialExpired ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${trialExpired ? 'bg-red-200' : 'bg-blue-200'}`}>!</div>
            <p className="text-sm font-bold uppercase tracking-widest">
              {trialExpired ? 'Free Trial Ended' : `${trialDaysLeft} Days left in your free trial`}
            </p>
          </div>
          {trialExpired && <span className="text-[10px] font-black underline cursor-pointer">Upgrade Now</span>}
        </div>
      )}

      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Follow-up Checklist</h2>
        <div className="mt-2">
          {totalNeedsAttention === 0 ? (
            <p className="text-gray-400 font-bold italic">No pending contacts for today. Go find more leads.</p>
          ) : (
            <p className="text-gray-600 font-medium">
              You have <span className="text-blue-600 font-bold underline">{totalNeedsAttention}</span> clients to contact today.
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Clients</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{activeLeads.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Pipeline Value</p>
          <p className="text-2xl font-black text-gray-900 mt-0.5">₹{(pipelineValue / 100000).toFixed(1)}L</p>
        </div>
        <div className={`bg-white p-5 rounded-2xl border ${overdueFollowUps.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${overdueFollowUps.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>Overdue</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{overdueFollowUps.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm border-b-4 border-b-blue-600">
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Due Today</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{todayUpcomingFollowUps.length}</p>
        </div>
      </div>

      <div className="space-y-10">
        {overdueFollowUps.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4">Urgent: Missed Commitments</h3>
            <div className="space-y-3">
              {overdueFollowUps.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:border-red-400 border-2 border-red-100 rounded-2xl transition-all text-left shadow-lg shadow-red-50/50"
                >
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg">{lead.fullName}</p>
                    <p className="text-sm font-bold text-red-600">Missed: {formatDate(getNextFollowUp(lead)!.date)}</p>
                  </div>
                  <div className="text-white bg-red-600 px-4 py-2 rounded-lg font-bold text-sm">CALL NOW</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Today's Schedule</h3>
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
                    <p className="text-sm text-gray-500 font-medium">
                      <span className="text-blue-600 font-bold">{getNextFollowUp(lead)?.type}</span> at {new Date(getNextFollowUp(lead)!.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">All caught up for today.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
