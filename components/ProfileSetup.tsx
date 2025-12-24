
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ProfileSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use upsert to handle both insert (if trigger failed) and update (normal flow)
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            full_name: fullName, 
            phone: phone 
          });

        if (updateError) throw updateError;
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-gray-200 shadow-xl">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Final Step.</h2>
        <p className="text-gray-500 text-sm font-medium mb-8">We need your professional details for your profile.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Full Name</label>
            <input
              required
              placeholder="e.g. Somesh Mishra"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your WhatsApp Phone</label>
            <input
              required
              type="tel"
              className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl text-white bg-gray-900 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Enter App'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
