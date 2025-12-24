
import React from 'react';

interface PaywallProps {
  onCancel: () => void;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  isHardLock?: boolean;
}

const Paywall: React.FC<PaywallProps> = ({ onCancel, userId, userEmail, userPhone, isHardLock = false }) => {
  const handlePayment = () => {
    // Pulls from environment variables in your local setup
    const RAZORPAY_KEY = process.env.RAZORPAY_KEY || "rzp_test_YOUR_KEY_HERE"; 
    
    if (!(window as any).Razorpay) {
      alert("Razorpay is currently unavailable. Check your connection.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: 49900, // ₹499.00 (amount in paise)
      currency: "INR",
      name: "SoloAgent Pro",
      description: "Unlimited Pipeline Protection",
      prefill: {
        email: userEmail || "",
        contact: userPhone || ""
      },
      notes: {
        user_id: userId 
      },
      theme: { color: "#2563eb" },
      handler: function(response: any) {
        alert("Payment successful. Your dashboard will unlock in a few moments.");
        window.location.reload();
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className={`fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] ${isHardLock ? 'cursor-default' : ''}`}>
      <div className="bg-white rounded-[32px] max-w-md w-full p-10 text-center space-y-8 shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Visual Polish */}
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
            {isHardLock ? 'Trial Ended.' : 'Unlock Pro.'}
          </h3>
          <p className="text-gray-500 font-medium">
            Your 7-day trial has concluded. Upgrade to SoloAgent Pro to continue managing your pipeline and follow-ups.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-4">
          <div className="flex justify-between items-baseline">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Solo Professional</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">₹499</span>
              <span className="text-xs font-bold text-gray-400">/mo</span>
            </div>
          </div>
          <ul className="space-y-2">
            {['Unlimited Leads & History', 'Smart Follow-up Alerts', 'Direct WhatsApp Linking'].map(item => (
              <li key={item} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={handlePayment} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:-translate-y-1 transition-all active:scale-95">
            Activate Pro Workspace
          </button>
          {!isHardLock && (
            <button onClick={onCancel} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">
              Maybe later
            </button>
          )}
        </div>
        
        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest pt-4 italic">
          Secure payment processed via Razorpay
        </p>
      </div>
    </div>
  );
};

export default Paywall;
