import React, { useState } from 'react';
import { Lead, InterestType, LeadStatus } from '../types';
import { supabase } from '../supabaseClient';
import Paywall from './Paywall';

interface LeadFormProps {
  onSave: (lead: Lead) => void;
  onCancel: () => void;
  isActive: boolean;
  userContext: {
    profile: any;
    email: string;
  };
  isLocalMode?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSave, onCancel, isActive, userContext, isLocalMode }) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    interestType: InterestType.Buy,
    budget: '',
    area: '',
    status: LeadStatus.New,
    initialNote: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.phone) {
      setError("Name and Phone are required to create a prospect.");
      return;
    }

    if (!isLocalMode && !isActive) {
      setShowPaywall(true);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLocalMode) {
        const localId = Math.random().toString(36).substr(2, 9);
        const newLead: Lead = {
          id: localId,
          user_id: 'local-user',
          fullName: formData.fullName,
          phone: formData.phone,
          interestType: formData.interestType,
          budget: Number(formData.budget) || 0,
          area: formData.area,
          status: formData.status,
          notes: formData.initialNote.trim() ? [{
            id: 'note-' + localId,
            lead_id: localId,
            text: formData.initialNote.trim(),
            createdAt: new Date().toISOString()
          }] : [],
          followUps: [],
          createdAt: new Date().toISOString()
        };
        onSave(newLead);
        return;
      }

      if (!supabase) throw new Error("Database not connected.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please log in again.");

      const { data: leadData, error: leadError } = await supabase.from('leads').insert({
        user_id: user.id,
        name: formData.fullName,
        phone: formData.phone,
        interest: formData.interestType,
        budget: Number(formData.budget) || 0,
        area: formData.area,
        status: formData.status
      }).select().single();

      if (leadError) throw new Error(leadError.message);
      if (!leadData) throw new Error("No data returned from server.");

      let initialNotes: any[] = [];
      if (formData.initialNote.trim()) {
        const { data: noteData, error: noteError } = await supabase.from('notes').insert({
          lead_id: leadData.id,
          text: formData.initialNote.trim()
        }).select().single();
        
        if (!noteError && noteData) {
          initialNotes = [{ ...noteData, createdAt: noteData.created_at }];
        }
      }

      onSave({
        ...leadData,
        fullName: leadData.name,
        interestType: leadData.interest,
        notes: initialNotes,
        followUps: [],
        createdAt: leadData.created_at
      });

    } catch (err: any) {
      setError(err.message || "Failed to save prospect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">New Prospect.</h2>
        <p className="text-gray-500 font-medium mt-2">Log the details now while they are fresh in your mind.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-xl space-y-10">
        {error && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex flex-col items-center gap-2">
            <p className="text-red-600 font-black text-[10px] uppercase tracking-widest text-center">Action Required</p>
            <p className="text-red-700 text-sm font-bold text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prospect Name *</label>
            <input
              autoFocus
              required
              disabled={isSubmitting}
              type="text"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp Phone *</label>
            <input
              required
              disabled={isSubmitting}
              type="tel"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              placeholder="+91"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Approx. Budget (₹)</label>
            <input
              disabled={isSubmitting}
              type="number"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              placeholder="e.g. 8000000"
              value={formData.budget}
              onChange={(e) => updateField('budget', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Requirement Area</label>
            <input
              disabled={isSubmitting}
              type="text"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              placeholder="e.g. Indiranagar, South Delhi"
              value={formData.area}
              onChange={(e) => updateField('area', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Interest Type</label>
            <select
              disabled={isSubmitting}
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none disabled:opacity-50"
              value={formData.interestType}
              onChange={(e) => updateField('interestType', e.target.value as InterestType)}
            >
              {Object.values(InterestType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Context / Requirement Details</label>
            <textarea
              disabled={isSubmitting}
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[100px] disabled:opacity-50"
              placeholder="What specifically are they looking for?"
              value={formData.initialNote}
              onChange={(e) => updateField('initialNote', e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="flex-1 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {isSubmitting ? 'SAVING...' : 'Add and Set Callback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
