
import React, { useState, useEffect } from 'react';
import { Lead, View, Profile as ProfileType } from './types';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
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
import { canUserAccessApp, loadLeads, saveLeads } from './utils';

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

  // Core Access Gate
  const hasAccess = canUserAccessApp(profile);

  useEffect(() => {
    if (!supabase) {
      setIsLocalMode(true);
      setLeads(loadLeads());
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
        supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
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
          created_at: profileData?.created_at,
          subscription: subData || undefined
        });
        setCurrentView('profile-setup');
      } else {
        setProfile({ 
          ...profileData, 
          subscription: subData || undefined
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
          notes: (l.notes || []).map((n: any) => ({ ...n, createdAt: n.created_at })),
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
      console.error("Database sync failed, continuing locally.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('lead-detail');
  };

  const updateLeadInState = (updatedLead: Lead) => {
    setLeads(prev => {
      const next = prev.map(l => l.id === updatedLead.id ? updatedLead : l);
      if (isLocalMode) saveLeads(next);
      return next;
    });
  };

  const addLead = (newLead: Lead) => {
    setLeads(prev => {
      const next = [newLead, ...prev];
      if (isLocalMode) saveLeads(next);
      return next;
    });
    setSelectedLeadId(newLead.id);
    setCurrentView('lead-detail');
  };

  const deleteLead = (id: string) => {
    setLeads(prev => {
      const next = prev.filter(l => l.id !== id);
      if (isLocalMode) saveLeads(next);
      return next;
    });
    setCurrentView('leads');
  };

  if (loading) return null;

  if (showLanding) {
    return <LandingPage onStart={() => { setAuthMode('signup'); setShowLanding(false); }} onLogin={() => { setAuthMode('login'); setShowLanding(false); }} />;
  }

  if (!session) {
    return <Auth initialMode={authMode} onBack={() => setShowLanding(true)} />;
  }

  const renderView = () => {
    if (currentView === 'profile-setup') return <ProfileSetup onComplete={() => fetchUserData(session.user.id)} />;
    
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
            userContext={{ profile, email: session.user.email }}
            isLocalMode={isLocalMode}
          />
        ) : null;
      case 'add-lead':
        return <LeadForm isActive={hasAccess} onSave={addLead} onCancel={() => setCurrentView('leads')} userContext={{ profile, email: session.user.email }} isLocalMode={isLocalMode} />;
      case 'profile':
        return <Profile profile={profile} email={session.user.email} onUpdate={(u) => setProfile(u)} isLocalMode={isLocalMode} />;
      case 'feedback':
        return <Feedback isLocalMode={isLocalMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 pb-24 md:pb-0">
      {/* GLOBAL PAYWALL GATE */}
      {!isLocalMode && !hasAccess && currentView !== 'profile' && currentView !== 'feedback' && (
        <Paywall 
          onCancel={() => {}} 
          userId={profile?.id} 
          userEmail={session?.user?.email} 
          userPhone={profile?.phone} 
          isHardLock={true}
        />
      )}
      
      <div className="hidden md:block">
        <Sidebar currentView={currentView} setView={setCurrentView} onLogout={() => supabase?.auth.signOut()} />
      </div>
      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative">
        {renderView()}
      </main>
      <div className="md:hidden">
        <BottomNav currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;
