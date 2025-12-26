
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, FollowUpType, Note, FollowUp, FollowUpOutcome } from '../types';
import { formatDate, isOverdue, getWhatsAppLink, getQuickDate, formatIndianNumber } from '../utils';
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
    <Paywall onCancel={() => setShowPaywall(false)} userId={userContext.profile?.id} userEmail={userContext.email} userPhone={userContext.profile?.phone} />
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 -ml-3 hover:bg-white rounded-full transition-all border-2 border-transparent hover:border-gray-200">
            <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">{lead.fullName}</h2>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em]">{lead.area}</span>
               <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
               <span className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em]">₹{formatIndianNumber(lead.budget)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
           <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-200 active:scale-95 transition-all">
             WhatsApp
           </button>
           <button onClick={() => setShowFollowUpModal(true)} className="flex-1 bg-blue-700 text-white px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 active:scale-95 transition-all">
             Schedule
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:order-3 space-y-8">
          <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${overdue ? 'bg-red-50 border-red-500 shadow-red-200/50' : nextAction ? 'bg-blue-50 border-blue-500 shadow-blue-200/50' : 'bg-amber-50 border-amber-500 shadow-amber-200/50'}`}>
            <p className="text-[11px] uppercase font-black tracking-[0.2em] mb-6 text-gray-700">NEXT ACTION</p>
            {nextAction ? (
              <div className="space-y-6">
                <div>
                   <p className={`text-2xl font-black ${overdue ? 'text-red-800' : 'text-blue-800'}`}>{nextAction.type}</p>
                   <p className="text-sm font-bold text-gray-700 mt-2">{formatDate(nextAction.date)}</p>
                </div>
                {nextAction.notes && (
                  <div className="bg-white/80 p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm italic text-gray-800 font-medium">"{nextAction.notes}"</p>
                  </div>
                )}
                
                {showOutcomeSelection ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {Object.values(FollowUpOutcome).map(outcome => (
                      <button key={outcome} onClick={() => markDoneWithOutcome(outcome)} className="bg-white hover:bg-gray-100 border-2 border-gray-200 p-4 rounded-xl text-[10px] font-black uppercase text-gray-800 tracking-tighter text-center transition-all shadow-sm">
                        {outcome.split(' - ')[0]}
                      </button>
                    ))}
                    <button onClick={() => setShowOutcomeSelection(false)} className="col-span-2 text-xs font-black text-gray-500 mt-4 hover:underline text-center uppercase tracking-widest">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setShowOutcomeSelection(true)} className="w-full bg-gray-900 text-white py-5 rounded-2xl text-xs font-black shadow-xl shadow-gray-300 uppercase tracking-[0.2em] active:scale-95 transition-all">
                    Set Outcome
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <p className="text-amber-800 font-black text-2xl">NO PLAN</p>
                <p className="text-xs text-amber-900 font-bold uppercase tracking-widest leading-relaxed">Leads without plans are lost leads.</p>
                <button onClick={() => setShowFollowUpModal(true)} className="w-full bg-amber-600 text-white py-5 rounded-2xl text-xs font-black shadow-xl shadow-amber-300 uppercase tracking-[0.2em]">Pick a Time</button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-300 shadow-md">
             <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em] mb-6">Past Steps</h4>
             <div className="space-y-4">
               {lead.followUps.filter(f => f.completed).reverse().slice(0, 4).map(f => (
                 <div key={f.id} className="flex flex-col gap-2 pb-4 border-b border-gray-100 last:border-0">
                   <div className="flex justify-between items-center">
                     <span className="font-black text-gray-900 uppercase text-xs tracking-tighter">{f.type}</span>
                     <span className="text-xs font-bold text-gray-500">{formatDate(f.date).split(',')[0]}</span>
                   </div>
                   {f.outcome && <span className="text-blue-700 font-black uppercase text-[10px] tracking-widest">→ {f.outcome}</span>}
                 </div>
               ))}
               {lead.followUps.filter(f => f.completed).length === 0 && <p className="text-xs italic text-gray-400 font-bold">No history recorded.</p>}
             </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-300 shadow-md grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-600 uppercase font-black tracking-[0.2em]">Phone</p>
              <p className="font-black text-gray-900 text-lg md:text-xl">{lead.phone}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] text-gray-600 uppercase font-black tracking-[0.2em]">Intent</p>
              <p className="font-black text-gray-900 text-lg md:text-xl">{lead.interestType}</p>
            </div>
            <div className="col-span-2 pt-6 border-t border-gray-100">
              <p className="text-[11px] text-gray-600 uppercase font-black tracking-[0.2em] mb-5">Lead Stage</p>
              <div className="flex flex-wrap gap-3">
                {Object.values(LeadStatus).map(status => (
                  <button key={status} onClick={() => handleStatusChange(status)} className={`px-4 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${lead.status === status ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900'}`}>{status}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-300 shadow-md overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-gray-900 text-xs uppercase tracking-[0.2em]">Context History</h3>
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{lead.notes.length} LOGS</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="relative">
                <input type="text" placeholder="Add details..." className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} />
                <button onClick={addNote} className="absolute right-3 top-3 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 shadow-lg">Save</button>
              </div>
              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {lead.notes.map(note => (
                  <div key={note.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-900 leading-relaxed font-semibold">{note.text}</p>
                    <p className="text-[10px] text-gray-500 mt-3 font-black uppercase tracking-[0.2em]">{formatDate(note.createdAt)}</p>
                  </div>
                ))}
                {lead.notes.length === 0 && <p className="text-center py-10 text-gray-400 font-bold italic text-sm">No context notes added yet.</p>}
              </div>
            </div>
          </div>

          <button onClick={handleDelete} className="w-full py-5 text-red-700 text-xs font-black hover:bg-red-50 transition-all uppercase tracking-[0.3em] border-2 border-dashed border-red-200 rounded-2xl">
            Delete Client
          </button>
        </div>
      </div>

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 z-[1000]">
          <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] w-full max-w-lg p-10 space-y-10 shadow-2xl border-t-8 border-blue-600 relative overflow-hidden">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Set Next Step</h3>
              <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest leading-relaxed">Lock in your next interaction with {lead.fullName}.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => scheduleFollowUp(getQuickDate('2h'))} className="py-5 bg-blue-50 text-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-100 hover:bg-blue-100 transition-all active:scale-95">+2 Hours</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('tomorrow'))} className="py-5 bg-blue-50 text-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-100 hover:bg-blue-100 transition-all active:scale-95">Tomorrow</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('3d'))} className="py-5 bg-blue-50 text-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-100 hover:bg-blue-100 transition-all active:scale-95">+3 Days</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-3">Pick Specific Date/Time</label>
                <input type="datetime-local" className="w-full border-2 border-gray-200 rounded-2xl px-6 py-5 text-base font-bold text-black outline-none bg-gray-100 focus:bg-white focus:border-blue-500" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-3">Interaction Method</label>
                <select className="w-full border-2 border-gray-200 rounded-2xl px-6 py-5 text-base font-bold text-black outline-none bg-gray-100 appearance-none focus:bg-white focus:border-blue-500 shadow-sm" value={followUpType} onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}>
                  {Object.values(FollowUpType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={() => setShowFollowUpModal(false)} className="flex-1 py-5 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-gray-900">Cancel</button>
              <button onClick={() => scheduleFollowUp()} disabled={!followUpDate} className="flex-[2] py-6 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-30">Save Commitment</button>
            </div>
            <div className="md:hidden h-10"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
