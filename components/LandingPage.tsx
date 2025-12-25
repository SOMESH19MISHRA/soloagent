
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const whatsappNumber = "917987376314"; 
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Somesh, I found SoloAgent and wanted to know if it’s right for my real estate work.")}`;

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl">S</div>
          <span className="font-black text-xl sm:text-2xl tracking-tighter hidden xs:block">SoloAgent</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <button onClick={onLogin} className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">Login</button>
          <button onClick={onStart} className="bg-gray-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:-translate-y-0.5 transition-all whitespace-nowrap">Start Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center md:text-left">
        <h1 className="text-5xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8">
          Never miss a follow-up.<br/>
          <span className="text-blue-600">Never lose a commission.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium max-w-2xl mb-12 leading-relaxed">
          A simple follow-up tracker for solo real estate agents. Remember who to call next — without complicated systems.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto bg-blue-600 text-white px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-all active:scale-95"
          >
            Try it Free for 7 Days
          </button>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white border-2 border-gray-300 text-gray-900 px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-3 shadow-md"
          >
            Chat with the Founder on WhatsApp
          </a>
        </div>
        <p className="mt-6 text-[11px] font-black text-gray-600 uppercase tracking-widest text-center md:text-left">
          Early-stage product • Direct conversation • Feedback welcome
        </p>
      </header>

      {/* Problem Section */}
      <section className="bg-gray-100 py-32 border-y border-gray-300 shadow-inner">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-10 text-gray-900">
            Following up shouldn’t be this hard.
          </h2>
          <div className="space-y-8 text-xl text-gray-700 font-medium leading-relaxed">
            <p>If you’re a solo agent, this probably sounds familiar:</p>
            <ul className="space-y-6">
              {[
                "Leads come from calls, WhatsApp, referrals",
                "You tell yourself “I’ll call them later”",
                "A day turns into a week",
                "The deal quietly dies because you forgot to follow up"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4 text-gray-900 font-bold">
                  <span className="shrink-0 mt-1.5 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="pt-4 text-gray-900 font-bold border-l-4 border-gray-900 pl-6">
              It’s not because you’re bad at selling. It’s because follow-ups slip through the cracks.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">SoloAgent does one thing well.</h2>
          <div className="grid md:grid-cols-2 gap-12 text-lg text-gray-700 font-medium leading-relaxed mb-16">
            <div className="space-y-6">
              <p>SoloAgent helps you keep track of:</p>
              <ul className="space-y-4">
                {["Who you need to follow up with", "When you should contact them next", "Which leads are overdue"].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-900 font-bold">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">✓</span>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <p className="text-gray-900 font-black">That’s all it does — by design.</p>
              </div>
            </div>
            <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl space-y-4">
               <p className="text-blue-100 font-black uppercase tracking-widest text-xs">Simplicity First</p>
               <ul className="space-y-2 font-bold text-sm">
                 <li>• No pipelines.</li>
                 <li>• No dashboards you never use.</li>
                 <li>• No learning curve.</li>
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-32 border-t border-gray-300">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Add a lead', desc: 'Name, phone number, area, budget. Takes 10 seconds.' },
              { step: '02', title: 'Set the next step', desc: 'Call, message, or visit — with a date and time.' },
              { step: '03', title: 'Open the app daily', desc: 'You immediately see who needs your attention.' }
            ].map((item, i) => (
              <div key={i} className="space-y-6 relative group bg-white p-8 rounded-3xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-gray-200 group-hover:bg-blue-600 group-hover:-translate-y-1 transition-all">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                <p className="text-gray-700 font-bold text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-20 p-10 bg-gray-900 rounded-[2.5rem] border border-gray-800 italic text-gray-300 font-bold text-lg text-center shadow-2xl">
            "If there’s no follow-up set, it shows up clearly. Nothing gets forgotten."
          </div>
        </div>
      </section>

      {/* Fit Section */}
      <section className="py-32 bg-gray-100 border-y border-gray-300">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16 text-center text-gray-900">Is SoloAgent right for you?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-300 shadow-sm space-y-6">
              <h3 className="text-emerald-700 font-black uppercase tracking-widest text-xs">Good fit if you are:</h3>
              <ul className="space-y-4 text-lg font-bold text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  A solo real estate agent
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Managing leads on your own
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Tired of memory-based follow-ups
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-300 shadow-sm space-y-6">
              <h3 className="text-red-700 font-black uppercase tracking-widest text-xs">Not a fit if you want:</h3>
              <ul className="space-y-4 text-lg font-bold text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  A full CRM with teams
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Marketing or analytics tools
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Complex deal pipelines
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-16 text-center text-gray-900 font-black uppercase tracking-widest text-xs">
            SoloAgent is intentionally simple.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-8 text-gray-900">Built by a real person.</h2>
          <div className="space-y-6 text-xl text-gray-700 font-medium leading-relaxed">
            <p>Hi, I’m <span className="text-blue-600 font-black">Somesh</span>.</p>
            <p>
              I built SoloAgent after seeing how often solo agents lose deals — not because of lack of effort, but because follow-ups get missed.
            </p>
            <p>
              This is still an early version. I’m personally talking to users and improving it based on real feedback. If something feels off, you can reach me directly.
            </p>
          </div>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex items-center gap-3 text-blue-600 font-black text-lg uppercase tracking-widest hover:underline"
          >
            Chat with me on WhatsApp →
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-12">Simple pricing.</h2>
          <div className="bg-white rounded-[40px] p-12 shadow-2xl text-gray-900">
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-7xl font-black">₹1</span>
              <span className="text-xl font-bold text-gray-400">/mo</span>
            </div>
            <div className="space-y-4 mb-10 text-gray-700 font-bold">
              <p className="text-blue-600">7-day free trial</p>
              <p>Cancel anytime.</p>
            </div>
            <button 
              onClick={onStart}
              className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:-translate-y-1 transition-all"
            >
              Start Free Trial
            </button>
            <p className="mt-8 text-xs text-gray-500 font-black leading-relaxed uppercase tracking-widest">
              No free forever plan. Built for serious agents.
            </p>
          </div>
        </div>
      </section>

      {/* Final Footer */}
      <footer className="py-20 text-center bg-gray-100 border-t border-gray-300">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
           <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
            <span className="font-black text-xl tracking-tighter text-gray-900">SoloAgent</span>
          </div>
          <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            SoloAgent is an early version product. Features may change based on user feedback.
          </p>
          <div className="flex justify-center gap-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">
            <span>© 2025 SoloAgent CRM</span>
            <button className="hover:text-gray-900 transition-colors">Privacy</button>
            <button className="hover:text-gray-900 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
