
import React, { useState } from 'react';
import { Profile as ProfileType } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileProps {
  profile: ProfileType | null;
  email: string | undefined;
  onUpdate: (updated: ProfileType) => void;
  onLogout: () => void;
  isLocalMode?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ profile, email, onUpdate, onLogout, isLocalMode }) => {
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocalMode) {
      if (profile) onUpdate({ ...profile, full_name: name, phone: phone });
      setMessage('Saved Locally');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!profile || !supabase) return;
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name, phone: phone })
        .eq('id', profile.id);

      if (error) throw error;
      
      onUpdate({ ...profile, full_name: name, phone: phone });
      setMessage('Saved');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Profile</h2>
      <p className="text-gray-500 font-medium mb-10 italic">This information is used for your account and reminders.</p>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address (Read-only)</label>
            <input
              type="text"
              readOnly
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
              value={email || 'local@offline.dev'}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Status</label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">
                {isLocalMode ? 'Local Lifetime' : (profile?.subscription?.is_active ? 'Active Pro' : 'Free Trial')}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? 'UPDATING...' : 'Update profile'}
          </button>
          {message && <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{message}</span>}
        </div>
      </form>

      <div className="mt-12 pt-10 border-t border-gray-200">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Danger Zone</h3>
        <button 
          onClick={onLogout}
          className="w-full md:w-auto bg-red-50 text-red-700 border-2 border-red-100 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out of Account
        </button>
      </div>
      
      {isLocalMode && (
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
           <p className="text-xs text-amber-800 font-bold leading-relaxed">
             Note: You are currently using the app without a cloud connection. Data is saved only in this browser. Add your Supabase keys to the environment to enable cross-device syncing.
           </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
