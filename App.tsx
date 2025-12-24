
import React, { useState, useEffect } from 'react';
import { Lead, View, Profile as ProfileType } from './types';
import { supabase, clearManualConfig } from './supabaseClient';
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
import { isTrialExpired, loadLeads, saveLeads } from './utils';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Derived Access State
  const hasAccess = profile ? (profile.is_active || !isTrialExpired(profile.created_at)) : true;

  useEffect(() => {
    if (!supabase) {
      // ENTER LOCAL MODE: If no Supabase key is found, use local storage
      setIsLocalMode(true);
      const localLeads = loadLeads();
      setLeads(localLeads);
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
        // Fallback to local mode on connection failure
        setIsLocalMode(true);
        setLeads(loadLeads());
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
      console.error("Database fetch failed, continuing in local mode.", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('lead-detail');
  };

  const updateLeadInState = (updatedLead: Lead) => {
    const newLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
    setLeads(newLeads);
    if (isLocalMode) saveLeads(newLeads);
  };

  const addLead = (newLead: Lead) => {
    const newLeads = [newLead, ...leads];
    setLeads(newLeads);
    if (isLocalMode) saveLeads(newLeads);
    setSelectedLeadId(newLead.id);
    setCurrentView('lead-detail');
  };

  const deleteLead = (id: string) => {
    const newLeads = leads.filter(l => l.id !== id);
    setLeads(newLeads);
    if (isLocalMode) saveLeads(newLeads);
    setCurrentView('leads');
  };

  // Skip auth for local mode
  const handleStart = () => {
    if (isLocalMode) {
      setShowLanding(false);
      setProfile({
        id: 'local-user',
        full_name: 'Local Agent',
        phone: 'N/A',
        is_active: true,
        created_at: new Date().toISOString()
      });
      setCurrentView('dashboard');
    } else {
      setAuthMode('signup');
      setShowLanding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Loading Workspace...</p>
      </div>
    </div>
  );

  if (showLanding) {
    return <LandingPage onStart={handleStart} onLogin={() => { setAuthMode('login'); setShowLanding(false); }} />;
  }

  if (!session && !isLocalMode) return <Auth initialMode={authMode} onBack={() => setShowLanding(true)} />;

  const renderView = () => {
    if (currentView === 'profile-setup' && !isLocalMode) return <ProfileSetup onComplete={() => fetchUserData(session?.user?.id)} />;
    
    const userContext = { profile, email: session?.user?.email || 'local@offline.dev' };

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
            onDelete={deleteLead}
            onBack={() => setCurrentView('leads')}
            isActive={hasAccess}
            userContext={userContext}
          />
        ) : <div className="p-20 text-center font-bold text-gray-400">Lead not found.</div>;
      case 'add-lead':
        return <LeadForm isActive={hasAccess} onSave={addLead} onCancel={() => setCurrentView('leads')} userContext={userContext} />;
      case 'profile':
        return <Profile profile={profile} email={userContext.email} onUpdate={(u) => setProfile(u)} />;
      case 'feedback':
        return <Feedback />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* GLOBAL PAYWALL LOCK - Disabled for Local Mode */}
      {!isLocalMode && !hasAccess && currentView !== 'profile' && currentView !== 'feedback' && (
        <Paywall 
          onCancel={() => {}} 
          userId={profile?.id} 
          userEmail={session?.user?.email} 
          userPhone={profile?.phone} 
          isHardLock={true}
        />
      )}
      
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={() => isLocalMode ? window.location.reload() : supabase?.auth.signOut()} 
        onResetConfig={clearManualConfig} 
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {isLocalMode && (
          <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200 z-[60]">
            Local Mode (Offline)
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
};

export default App;
