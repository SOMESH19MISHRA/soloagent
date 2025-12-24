
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
}

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onUpdate, onDelete, onBack, isActive, userContext }) => {
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
    if (!isActive) {
      setShowPaywall(true);
      return;
    }

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
    const { error } = await supabase.from('leads').update({ status }).eq('id', lead.id);
    if (!error) onUpdate({ ...lead, status });
  };

  const handleDelete = async () => {
    if (confirm('Delete this client record? This action cannot be undone.')) {
      const { error } = await supabase.from('leads').delete().eq('id', lead.id);
      if (!error) onDelete(lead.id);
    }
  };

  const handleWhatsApp = () => {
    if (!isActive) {
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{lead.fullName}</h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{lead.area}</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               <span className="text-sm font-bold text-blue-600">₹{lead.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleWhatsApp}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5"
           >
             WHATSAPP
           </button>
           <button 
             onClick={() => setShowFollowUpModal(true)}
             className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5"
           >
             RESCHEDULE
           </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center">
          <p className="text-red-600 text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-2 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Phone Number</p>
              <p className="font-bold text-gray-900 text-lg">{lead.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Intent</p>
              <p className="font-bold text-gray-900 text-lg">{lead.interestType}</p>
            </div>
            <div className="col-span-2 md:col-span-2 pt-4 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Deal Stage</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(LeadStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all border-2 ${
                      lead.status === status 
                      ? 'bg-gray-900 border-gray-900 text-white' 
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
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Client Interaction History</h3>
              <span className="text-[10px] font-black text-gray-400">{lead.notes.length} LOGGED</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a quick note about your last talk..."
                  className="w-full border-2 border-gray-100 rounded-xl px-5 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 transition-all bg-gray-100"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <button 
                  onClick={addNote}
                  className="absolute right-2 top-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-black"
                >
                  SAVE
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {lead.notes.map(note => (
                  <div key={note.id} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                    <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
                    <p className="text-[10px] text-gray-400 mt-3 font-black uppercase tracking-widest">{formatDate(note.createdAt)}</p>
                  </div>
                ))}
                {lead.notes.length === 0 && <p className="text-center py-10 text-gray-300 italic text-sm">No notes recorded yet.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`p-8 rounded-2xl border-2 ${overdue ? 'bg-red-50 border-red-500 shadow-lg shadow-red-100' : nextAction ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-50' : 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-50'}`}>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-4 text-gray-500">SCHEDULED NEXT STEP</p>
            {nextAction ? (
              <div className="space-y-4">
                <div>
                   <p className={`text-2xl font-black ${overdue ? 'text-red-700' : 'text-blue-700'}`}>
                    {nextAction.type}
                  </p>
                  <p className="text-sm font-bold text-gray-600 mt-1">{formatDate(nextAction.date)}</p>
                </div>
                {nextAction.notes && (
                  <div className="bg-white/50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs italic text-gray-500">"{nextAction.notes}"</p>
                  </div>
                )}
                
                {showOutcomeSelection ? (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.values(FollowUpOutcome).map(outcome => (
                      <button
                        key={outcome}
                        onClick={() => markDoneWithOutcome(outcome)}
                        className="bg-white hover:bg-gray-50 border border-gray-200 p-2 rounded-lg text-[10px] font-black uppercase text-gray-600 tracking-tighter text-center transition-all"
                      >
                        {outcome.split(' - ')[0]}
                      </button>
                    ))}
                    <button 
                      onClick={() => setShowOutcomeSelection(false)}
                      className="col-span-2 text-[10px] font-bold text-gray-400 mt-2 hover:underline"
                    >
                      Wait, not completed
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowOutcomeSelection(true)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-gray-200 uppercase tracking-widest hover:-translate-y-0.5 transition-all"
                  >
                    Set Result & Next Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-amber-700 font-black text-lg">⚠ DROPPED BALL</p>
                <button 
                  onClick={() => setShowFollowUpModal(true)}
                  className="w-full bg-amber-600 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-amber-200 uppercase tracking-widest"
                >
                  Schedule Callback
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Past Activity</h4>
             <div className="space-y-4">
               {lead.followUps.filter(f => f.completed).reverse().slice(0, 4).map(f => (
                 <div key={f.id} className="flex flex-col gap-1 text-xs text-gray-400 font-medium border-b border-gray-50 pb-2">
                   <div className="flex justify-between">
                     <span className="font-black text-gray-500 uppercase">{f.type}</span>
                     <span>{formatDate(f.date).split(',')[0]}</span>
                   </div>
                   {f.outcome && <span className="text-blue-400 font-bold uppercase text-[9px]">Result: {f.outcome}</span>}
                 </div>
               ))}
             </div>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full py-4 text-red-400 text-[10px] font-black hover:text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
          >
            Archive Client
          </button>
        </div>
      </div>

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-8 shadow-2xl border border-gray-100">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Set Next Step</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => scheduleFollowUp(getQuickDate('2h'))} className="py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">+2 Hours</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('tomorrow'))} className="py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">Tomorrow</button>
              <button onClick={() => scheduleFollowUp(getQuickDate('3d'))} className="py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">+3 Days</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">When?</label>
                <input type="datetime-local" className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none bg-gray-100" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Method</label>
                <select className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none bg-gray-100" value={followUpType} onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}>
                  {Object.values(FollowUpType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowFollowUpModal(false)} className="flex-1 py-3 text-gray-400 font-black text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={() => scheduleFollowUp()} disabled={!followUpDate} className="flex-[2] py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-30">Lock Step</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
