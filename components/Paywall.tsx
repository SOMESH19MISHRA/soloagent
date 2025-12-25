
import React from 'react';
import { supabase } from '../supabaseClient';

interface PaywallProps {
  onCancel: () => void;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  isHardLock?: boolean;
}

const Paywall: React.FC<PaywallProps> = ({ onCancel, userId, userEmail, userPhone, isHardLock = false }) => {
  const handlePayment = async () => {
    console.log("Initiating Razorpay payment flow...");

    // Vite environment variables must be accessed via import.meta.env
    const env = (import.meta as any).env;
    const RAZORPAY_KEY = env?.VITE_RAZORPAY_KEY_ID; 
    
    if (!RAZORPAY_KEY) {
      console.error("VITE_RAZORPAY_KEY_ID is missing from environment variables.");
      alert("Configuration Error: Razorpay Key not found. If you are on Vercel, check your Environment Variables and redeploy.");
      return;
    }

    if (!(window as any).Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet connection and refresh.");
      return;
    }

    if (!userId || !supabase) {
      alert("Session error. Please log in again to continue.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: 49900, // ₹499.00 (amount in paise)
      currency: "INR",
      name: "SoloAgent Pro",
      description: "30-Day Professional Access",
      prefill: {
        email: userEmail || "",
        contact: userPhone || ""
      },
      notes: {
        user_id: userId 
      },
      theme: { color: "#2563eb" },
      modal: {
        ondismiss: function() {
          console.log("Payment modal closed by user.");
        }
      },
      handler: async function(response: any) {
        console.log("Payment successful! Updating subscription...", response.razorpay_payment_id);
        
        const paidUntil = new Date();
        paidUntil.setDate(paidUntil.getDate() + 30);

        try {
          const { error } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              is_active: true,
              paid_until: paidUntil.toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) throw error;

          alert("Payment successful! Your Pro access is now active for 30 days.");
          window.location.reload(); 
        } catch (err: any) {
          console.error("Subscription update failed:", err);
          alert(`Payment succeeded (ID: ${response.razorpay_payment_id}) but access update failed. Please contact support.`);
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay construction error:", e);
      alert("Failed to initiate payment. See console for details.");
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] ${isHardLock ? 'cursor-default' : ''}`}>
      <div className="bg-white rounded-[32px] max-w-md w-full p-10 text-center space-y-8 shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
            {isHardLock ? 'Trial Ended.' : 'Unlock Pro.'}
          </h3>
          <p className="text-gray-500 font-medium">
            Manage your leads professionally without interruptions.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-4">
          <div className="flex justify-between items-baseline">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">30-Day Pass</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">₹499</span>
            </div>
          </div>
          <ul className="space-y-2">
            {['Unlimited Lead Tracking', 'Priority Follow-up Alerts', 'WhatsApp Integration', 'No Subscriptions'].map(item => (
              <li key={item} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
            ₹499 · 30-day pass
          </p>
          <button 
            onClick={handlePayment} 
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:-translate-y-1 transition-all active:scale-95"
          >
            Unlock Now for ₹499
          </button>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            One-time payment · No auto-renew
          </p>
          {!isHardLock && (
            <button onClick={onCancel} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">
              Maybe later
            </button>
          )}
        </div>
        
        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest pt-4 italic">
          Secure one-time payment via Razorpay
        </p>
      </div>
    </div>
  );
};

export default Paywall;
