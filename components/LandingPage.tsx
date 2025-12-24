
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const whatsappNumber = "910000000000"; // Replace with real support number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm interested in SoloAgent. Can you help me get started?")}`;

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
          <span className="font-black text-2xl tracking-tighter">SoloAgent</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onLogin} className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Login</button>
          <button onClick={onStart} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all">Start Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center md:text-left">
        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
          Never miss a follow-up.<br/>
          <span className="text-blue-600">Never lose a commission.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mb-12 leading-relaxed">
          A simple follow-up tracker for solo real estate agents. No complicated systems. Just a clear way to remember who to call next.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button 
            onClick={onStart}
            className="bg-blue-600 text-white px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-all active:scale-95"
          >
            Try it Free for 7 Days
          </button>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-2 border-gray-100 text-gray-900 px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-3"
          >
            Connect on WhatsApp
          </a>
        </div>
      </header>

      {/* Problem Section */}
      <section className="bg-gray-50 py-32 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">
            When follow-ups get buried in WhatsApp,<br/>
            the deal goes to someone else.
          </h2>
          <div className="grid md:grid-cols-2 gap-12 text-lg text-gray-500 font-medium leading-relaxed">
            <p>
              You speak to dozens of clients every week. Between site visits, calls, and hundreds of WhatsApp messages, even the best agents forget to follow up. It's not your fault—it's just too much to remember.
            </p>
            <ul className="space-y-4">
              {[
                "Important chats get pushed down",
                "Promised calls are missed",
                "Leads go cold without a reminder"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-900 font-bold">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-4">HOW IT WORKS</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-10">One simple rule:<br/>Every lead has a next step.</h2>
          <p className="text-xl md:text-2xl text-gray-500 font-medium mb-16 max-w-2xl mx-auto">
            This app doesn't try to manage your business. It manages your memory. It tells you <span className="text-gray-900 font-black">who to call and when.</span>
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Add in Seconds', desc: 'Quickly log the name, area, and budget of your new prospect.' },
              { title: 'Set Next Step', desc: 'Pick a time for your next call or visit. We handle the reminder.' },
              { title: 'One Daily List', desc: 'Open the app every morning to see exactly who needs a call.' }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-left">
                <span className="text-4xl font-black text-blue-600 opacity-20">0{i+1}</span>
                <h3 className="text-xl font-black mt-4 mb-2">{step.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning Section */}
      <section className="bg-gray-900 text-white py-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Not a CRM.<br/>An Assistant.</h2>
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl mb-12">
            Most CRMs are too complicated for a solo agent. SoloAgent is built for <span className="text-white font-black">WhatsApp-first</span> agents who need a clean, simple way to track their next move.
          </p>
          <div className="inline-block px-6 py-3 bg-white/10 rounded-xl border border-white/10 font-black text-xs uppercase tracking-widest">
            Built for Solo Real Estate Professionals
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-4">Clean Pricing. No Surprises.</h2>
          <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border-4 border-gray-900 p-10 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Professional Plan</div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Full Access</p>
            <div className="flex items-baseline justify-center gap-1 my-6">
              <span className="text-6xl font-black">₹499</span>
              <span className="text-lg font-bold text-gray-400">/mo</span>
            </div>
            <ul className="text-left space-y-4 mb-10">
              {['Unlimited Lead Storage', 'One-Click WhatsApp Follow-up', 'Daily Work Checklist', '7-Day Free Trial'].map(item => (
                <li key={item} className="flex items-center gap-3 font-bold text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={onStart}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 hover:-translate-y-1 transition-all"
            >
              Start Free Trial
            </button>
          </div>
          <p className="mt-8 text-gray-400 font-medium text-sm italic">If it saves even one deal, the app pays for itself for the year.</p>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="bg-gray-50 py-32 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black tracking-tight mb-8">Ready to clear your mind?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onStart} className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest">Start Now</button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 text-gray-900 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest">Questions? Message Us</a>
          </div>
          <div className="mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>© 2025 SoloAgent CRM</span>
            <div className="flex gap-8">
              <button className="hover:text-gray-900">Privacy Policy</button>
              <button className="hover:text-gray-900">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
