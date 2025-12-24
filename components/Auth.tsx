
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ onBack, initialMode = 'login' }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        if (error) throw error;
        
        // If signup is successful and we got a user but no session yet (standard for email verification)
        if (data.user && !data.session) {
          setIsEmailSent(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-gray-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Check your email.</h2>
          <p className="text-gray-500 font-medium">
            We've sent a verification link to <span className="text-gray-900 font-bold">{email}</span>. 
          </p>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-600 font-black uppercase tracking-widest leading-relaxed">
              Once you verify your email, please return here and log in again to access your dashboard.
            </p>
          </div>

          <button 
            onClick={() => {
              setIsEmailSent(false);
              setIsLogin(true);
              setError('');
            }} 
            className="w-full py-4 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            Go to Login
          </button>
          
          <button 
            onClick={() => setIsEmailSent(false)} 
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:underline"
          >
            Entered wrong email? Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-gray-200 shadow-xl relative">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}
        
        <div className="text-center">
          {!isLogin && (
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">S</div>
          )}
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back.' : 'Your Professional Workspace.'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Clear your mind. Follow up with discipline.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleAuth}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Professional Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91"
                    className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
              <p className="text-red-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-[0.2em] rounded-xl text-white bg-gray-900 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : isLogin ? 'Access Account' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setShowPassword(false);
            }}
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
