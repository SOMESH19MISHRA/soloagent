
import React, { useState, useEffect } from 'react';
import { Lead, View, Profile as ProfileType } from './types';
import { supabase, saveManualConfig, clearManualConfig } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadsList from './components/LeadsList';
import LeadDetail from './components/LeadDetail';
import LeadForm from './components/LeadForm';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import Feedback from './components/Feedback';
import Paywall from './components/Paywall';
import { isTrialExpired } from './utils';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Derived Access State
  const hasAccess = profile ? (profile.is_active || !isTrialExpired(profile.created_at)) : true;

  // Connection Wizard State
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [connError, setConnError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          setShowLanding(false);
          fetchUserData(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setFetchError("Connection Error: Failed to reach database server.");
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowLanding(false);
        fetchUserData(session.user.id);
      } else {
        setSession(null);
        setProfile(null);
        setLeads([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, retryCount = 0) => {
    if (!supabase) return;
    setLoading(true);
    setFetchError(null);
    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('subscriptions').select('is_active').eq('user_id', userId).maybeSingle()
      ]);

      if (profileRes.error) throw profileRes.error;
      const profileData = profileRes.data;
      const subData = subRes.data;

      if (!profileData && retryCount < 3) {
        setTimeout(() => fetchUserData(userId, retryCount + 1), 1000);
        return;
      }

      if (!profileData || !profileData.full_name || !profileData.phone) {
        setProfile({ 
          id: userId, 
          full_name: profileData?.full_name || '', 
          phone: profileData?.phone || '', 
          is_active: subData?.is_active || false,
          created_at: profileData?.created_at
        });
        setCurrentView('profile-setup');
      } else {
        setProfile({ 
          ...profileData, 
          is_active: subData?.is_active || false,
          created_at: profileData.created_at 
        });
        
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select(`*, notes (*), followups (*)`)
          .order('created_at', { ascending: false });
        
        if (leadsError) throw leadsError;

        const mappedLeads = (leadsData || []).map((l: any) => ({
          ...l,
          fullName: l.name,
          interestType: l.interest,
          notes: (l.notes || []).map((n: any) => ({ ...n, createdAt: n.created_at })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          followUps: (l.followups || []).map((f: any) => ({ 
            ...f, 
            date: f.followup_at,
            completed: f.completed || false,
            type: f.method
          })),
          createdAt: l.created_at
        }));
        
        setLeads(mappedLeads);
        if (currentView === 'profile-setup') setCurrentView('dashboard');
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        setFetchError("Network Error: Could not connect to Supabase.");
      } else {
        setFetchError("Database Error: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl || !manualKey) {
      setConnError('Both fields are required.');
      return;
    }
    setConnError('');
    saveManualConfig(manualUrl, manualKey);
  };

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('lead-detail');
  };

  const updateLeadInState = (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const addLead = (newLead: Lead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
    setSelectedLeadId(newLead.id);
    setCurrentView('lead-detail');
  };

  if (!supabase || fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white p-10 md:p-14 rounded-[40px] border-2 border-gray-100 shadow-2xl">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white mb-8">S</div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Database<br/>Connection.</h2>
          <p className="text-gray-500 font-medium mb-10">{fetchError ? "Failed to reach your database. Verify settings." : "Connect your Supabase instance."}</p>
          <form onSubmit={handleManualConnect} className="space-y-6">
            <input type="text" placeholder="Supabase URL" className="w-full bg-gray-100 border-2 rounded-2xl px-5 py-4 font-bold" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} />
            <input type="password" placeholder="Anon Key" className="w-full bg-gray-100 border-2 rounded-2xl px-5 py-4 font-bold" value={manualKey} onChange={(e) => setManualKey(e.target.value)} />
            {fetchError && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{fetchError}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Save & Connect</button>
          </form>
        </div>
      </div>
    );
  }

  if (!session && showLanding) {
    return <LandingPage onStart={() => { setAuthMode('signup'); setShowLanding(false); }} onLogin={() => { setAuthMode('login'); setShowLanding(false); }} />;
  }

  if (!session) return <Auth initialMode={authMode} onBack={() => setShowLanding(true)} />;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Syncing Workspace...</p>
      </div>
    </div>
  );

  const renderView = () => {
    if (currentView === 'profile-setup') return <ProfileSetup onComplete={() => fetchUserData(session.user.id)} />;
    
    // Feature gating logic
    const userContext = { profile, email: session?.user?.email };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard profile={profile} leads={leads} onNavigateToLead={navigateToLead} onViewLeads={() => setCurrentView('leads')} />;
      case 'leads':
        return <LeadsList leads={leads} onNavigateToLead={navigateToLead} onAddClick={() => setCurrentView('add-lead')} />;
      case 'lead-detail':
        const selectedLead = leads.find(l => l.id === selectedLeadId);
        return selectedLead ? (
          <LeadDetail 
            lead={selectedLead} 
            onUpdate={updateLeadInState}
            onDelete={(id) => setLeads(leads.filter(l => l.id !== id))}
            onBack={() => setCurrentView('leads')}
            isActive={hasAccess}
            userContext={userContext}
          />
        ) : <div className="p-20 text-center font-bold text-gray-400">Lead not found.</div>;
      case 'add-lead':
        return <LeadForm isActive={hasAccess} onSave={addLead} onCancel={() => setCurrentView('leads')} userContext={userContext} />;
      case 'profile':
        return <Profile profile={profile} email={session?.user?.email} onUpdate={(u) => setProfile(u)} />;
      case 'feedback':
        return <Feedback />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* GLOBAL PAYWALL LOCK */}
      {!hasAccess && currentView !== 'profile' && currentView !== 'feedback' && (
        <Paywall 
          onCancel={() => {}} 
          userId={profile?.id} 
          userEmail={session?.user?.email} 
          userPhone={profile?.phone} 
          isHardLock={true}
        />
      )}
      
      {currentView !== 'profile-setup' && (
        <Sidebar currentView={currentView} setView={setCurrentView} onLogout={() => supabase.auth.signOut()} onResetConfig={clearManualConfig} />
      )}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
