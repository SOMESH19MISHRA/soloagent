
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, FollowUpType, Note, FollowUp, FollowUpOutcome } from '../types';
import { formatDate, isOverdue, getWhatsAppLink, getQuickDate } from '../utils';
import { supabase } from '../supabaseClient';
import Paywall from './Paywall';

interface LeadDetailProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isActive: boolean;
  userContext: {
    profile: any;
    email: string;
  };
  isLocalMode?: boolean;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onUpdate, onDelete, onBack, isActive, userContext, isLocalMode }) => {
  const [newNote, setNewNote] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpType, setFollowUpType] = useState<FollowUpType>(FollowUpType.Call);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [showOutcomeSelection, setShowOutcomeSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextAction = lead.followUps.find(f => !f.completed);
  const overdue = nextAction && isOverdue(nextAction.date);

  useEffect(() => {
    if (lead.followUps.length === 0) {
      setShowFollowUpModal(true);
    }
  }, [lead.id]);

  const addNote = async () => {
    if (!newNote.trim()) return;

    if (isLocalMode) {
      const localNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        lead_id: lead.id,
        text: newNote,
        createdAt: new Date().toISOString()
      };
      onUpdate({ ...lead, notes: [localNote, ...lead.notes] });
      setNewNote('');
      return;
    }

    if (!supabase) return;

    const { data, error } = await supabase.from('notes').insert({
      lead_id: lead.id,
      text: newNote
    }).select().single();

    if (data) {
      onUpdate({ ...lead, notes: [{ ...data, createdAt: data.created_at }, ...lead.notes] });
      setNewNote('');
    }
  };

  const scheduleFollowUp = async (forcedDate?: string) => {
    const finalDate = forcedDate || followUpDate;
    if (!finalDate) return;
    if (!isActive && !isLocalMode) {
      setShowPaywall(true);
      return;
    }

    if (isLocalMode) {
      const localFollowUp: FollowUp = {
        id: Math.random().toString(36).substr(2, 9),
        lead_id: lead.id,
        date: new Date(finalDate).toISOString(),
        type: followUpType,
        notes: followUpNotes,
        completed: false
      };
      const updatedPrev = lead.followUps.map(f => f.completed ? f : { ...f, completed: true });
      onUpdate({ ...lead, followUps: [...updatedPrev, localFollowUp] });
      setShowFollowUpModal(false);
      setShowOutcomeSelection(false);
      setFollowUpDate('');
      setFollowUpNotes('');
      return;
    }

    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (nextAction) {
      await supabase.from('followups').update({ completed: true }).eq('id', nextAction.id);
    }

    const { data, error } = await supabase.from('followups').insert({
      user_id: user.id,
      lead_id: lead.id,
      followup_at: new Date(finalDate).toISOString(),
      method: followUpType,
      note: followUpNotes
    }).select().single();

    if (data) {
      const mappedNew = { ...data, date: data.followup_at, notes: data.note, completed: false, type: data.method };
      const updatedPrev = lead.followUps.map(f => f.completed ? f : { ...f, completed: true });
      onUpdate({ ...lead, followUps: [...updatedPrev, mappedNew] });
      setShowFollowUpModal(false);
      setShowOutcomeSelection(false);
      setFollowUpDate('');
      setFollowUpNotes('');
    }
  };

  const markDoneWithOutcome = async (outcome: FollowUpOutcome) => {
    if (!nextAction) return;
    setError(null);

    if (isLocalMode) {
      const updatedFollowUps = lead.followUps.map(f => 
        f.id === nextAction.id ? { ...f, completed: true, outcome } : f
      );
      onUpdate({ ...lead, followUps: updatedFollowUps });
      setShowOutcomeSelection(false);
      setShowFollowUpModal(true);
      return;
    }

    if (!supabase) return;

    let { error: updateError } = await supabase
      .from('followups')
      .update({ completed: true, outcome })
      .eq('id', nextAction.id);

    if (updateError) {
      const { error: simpleError } = await supabase
        .from('followups')
        .update({ completed: true })
        .eq('id', nextAction.id);
      
      updateError = simpleError;
    }

    if (!updateError) {
      const updatedFollowUps = lead.followUps.map(f => 
        f.id === nextAction.id ? { ...f, completed: true, outcome } : f
      );
      onUpdate({ ...lead, followUps: updatedFollowUps });
      setShowOutcomeSelection(false);
      setShowFollowUpModal(true);
    } else {
      setError("Update failed. Check your connection.");
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (isLocalMode) {
      onUpdate({ ...lead, status });
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from('leads').update({ status }).eq('id', lead.id);
    if (!error) onUpdate({ ...lead, status });
  };

  const handleDelete = async () => {
    if (confirm('Delete this client record? This action cannot be undone.')) {
      if (isLocalMode) {
        onDelete(lead.id);
        return;
      }
      if (!supabase) return;
      const { error } = await supabase.from('leads').delete().eq('id', lead.id);
      if (!error) onDelete(lead.id);
    }
  };

  const handleWhatsApp = () => {
    if (!isActive && !isLocalMode) {
      setShowPaywall(true);
      return;
    }
    window.open(getWhatsAppLink(lead.phone, lead.fullName), '_blank');
  };

  if (showPaywall) return (
    <Paywall 
      onCancel={() => setShowPaywall(false)} 
      userId={userContext.profile?.id}
      userEmail={userContext.email}
      userPhone={userContext.profile?.phone}
    />
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors border border-transparent">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{lead.fullName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lead.area}</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">₹{lead.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons Bar */}
        <div className="flex gap-2 w-full">
           <button 
             onClick={handleWhatsApp}
             className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 transition-all active:scale-95"
           >
             WhatsApp
           </button>
           <button 
             onClick={() => setShowFollowUpModal(true)}
             className="flex-1 bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
           >
             Reschedule
           </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
          <p className="text-red-600 text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Grid: 1 Col on mobile, 3 Col on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Next Task Card - Sticky style on Mobile or prominent */}
        <div className="md:order-3 space-y-6">
          <div className={`p-6 md:p-8 rounded-2xl border-2 ${overdue ? 'bg-red-50 border-red-500 shadow-lg shadow-red-100' : nextAction ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-50' : 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-50'}`}>
            <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-4 text-gray-500">NEXT COMMITMENT</p>
            {nextAction ? (
              <div className="space-y-4">
                <div>
                   <p className={`text-xl md:text-2xl font-black ${overdue ? 'text-red-700' : 'text-blue-700'}`}>
                    {nextAction.type}
                  </p>
                  <p className="text-xs md:text-sm font-bold text-gray-600 mt-1">{formatDate(nextAction.date)}</p>
                </div>
                {nextAction.notes && (
                  <div className="bg-white/50 p-3 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] italic text-gray-500">"{nextAction.notes}"</p>
                  </div>
                )}
                
                {showOutcomeSelection ? (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.values(FollowUpOutcome).map(outcome => (
                      <button
                        key={outcome}
                        onClick={() => markDoneWithOutcome(outcome)}
                        className="bg-white hover:bg-gray-50 border border-gray-200 p-3 rounded-xl text-[9px] font-black uppercase text-gray-600 tracking-tighter text-center transition-all shadow-sm"
                      >
                        {outcome.split(' - ')[0]}
                      </button>
                    ))}
                    <button 
                      onClick={() => setShowOutcomeSelection(false)}
                      className="col-span-2 text-[10px] font-bold text-gray-400 mt-2 hover:underline text-center"
                    >
                      Wait, not completed
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowOutcomeSelection(true)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-gray-200 uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Set Outcome
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-amber-700 font-black text-lg">⚠️ NO PLAN</p>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">You are losing this client.</p>
                <button 
                  onClick={() => setShowFollowUpModal(true)}
                  className="w-full bg-amber-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-amber-200 uppercase tracking-widest"
                >
                  Pick a Time
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
             <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Past Interactions</h4>
             <div className="space-y-3">
               {lead.followUps.filter(f => f.completed).reverse().slice(0, 3).map(f => (
                 <div key={f.id} className="flex flex-col gap-1 text-[10px] text-gray-400 font-medium border-b border-gray-50 pb-2">
                   <div className="flex justify-between">
                     <span className="font-black text-gray-500 uppercase">{f.type}</span>
                     <span>{formatDate(f.date).split(',')[0]}</span>
                   </div>
                   {f.outcome && <span className="text-blue-400 font-bold uppercase text-[8px]">Result: {f.outcome}</span>}
                 </div>
               ))}
               {lead.followUps.filter(f => f.completed).length === 0 && <p className="text-[10px] italic text-gray-300">No past tasks recorded.</p>}
             </div>
          </div>
        </div>

        {/* Client Details & Notes */}
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Phone</p>
              <p className="font-bold text-gray-900 text-sm md:text-lg">{lead.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Type</p>
              <p className="font-bold text-gray-900 text-sm md:text-lg">{lead.interestType}</p>
            </div>
            <div className="col-span-2 pt-4 border-t border-gray-50">
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-3">Pipeline Stage</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(LeadStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all border-2 ${
                      lead.status === status 
                      ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">Client Context</h3>
              <span className="text-[9px] font-black text-gray-400">{lead.notes.length} NOTES</span>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick context update..."
                  className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-black outline-none focus:border-blue-500 transition-all bg-gray-50"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <button 
                  onClick={addNote}
                  className="absolute right-2 top-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                >
                  Add
                </button>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {lead.notes.map(note => (
                  <div key={note.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{note.text}</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-black uppercase tracking-widest">{formatDate(note.createdAt)}</p>
                  </div>
                ))}
                {lead.notes.length === 0 && <p className="text-center py-6 text-gray-300 italic text-xs">No notes yet.</p>}
              </div>
            </div>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full py-4 text-red-400 text-[9px] font-black hover:text-red-600 transition-all uppercase tracking-widest border border-transparent hover:border-red-50 rounded-2xl"
          >
            Archive Client
          </button>
        </div>
      </div>

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[1000]">
          <div className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-md p-8 space-y-8 shadow-2xl border-t md:border border-gray-100 animate-slide-up md:animate-scale-in">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Lock Next Date</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Schedule your next move with {lead.fullName}.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => scheduleFollowUp(getQuickDate('2h'))} className="py-4 bg-blue-50 text-blue-700 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all active:scale-95">+2 Hours</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('tomorrow'))} className="py-4 bg-blue-50 text-blue-700 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all active:scale-95">Tomorrow</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('3d'))} className="py-4 bg-blue-50 text-blue-700 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all active:scale-95">+3 Days</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Custom Date/Time</label>
                <input type="datetime-local" className="w-full border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-black outline-none bg-gray-50 focus:bg-white focus:border-blue-500" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Follow-up Method</label>
                <select className="w-full border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-black outline-none bg-gray-50 appearance-none" value={followUpType} onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}>
                  {Object.values(FollowUpType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowFollowUpModal(false)} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button onClick={() => scheduleFollowUp()} disabled={!followUpDate} className="flex-[2] py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-30">Save Commitment</button>
            </div>
            <div className="md:hidden h-8"></div> {/* Extra space for mobile home bar */}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
