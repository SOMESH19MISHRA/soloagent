
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !supabase) return;
    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          message: feedback
        });

      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Thanks.</h2>
        <p className="text-gray-500 font-medium">This helps us build the right features.</p>
        <button 
          onClick={() => { setDone(false); setFeedback(''); }}
          className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Help us improve this app</h2>
      <p className="text-gray-500 font-medium mb-10">Tell us what’s missing, confusing, or slowing you down. We read every message.</p>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Message</label>
          <textarea
            required
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[160px]"
            placeholder="What's missing or annoying right now?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={sending || !feedback.trim()}
          className="bg-gray-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {sending ? 'SENDING...' : 'Send feedback'}
        </button>
      </form>

      <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-700 font-bold leading-relaxed">
          We review all feedback. Your input directly influences which features we build next for solo real estate professionals.
        </p>
      </div>
    </div>
  );
};

export default Feedback;
