import React from 'react';
import { ShieldCheck, Scale, Info, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  onAccept: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onAccept }) => {
  const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        <div className="p-8 flex flex-col items-center bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
           <img 
            src={logoUrl} 
            alt="Junior Speller Logo" 
            className="h-24 w-auto mb-4 object-contain"
          />
          <h2 className="text-xl font-extrabold text-[#003366] dark:text-blue-400 uppercase tracking-tight text-center">Competition Protocol</h2>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          <section className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <h3 className="flex items-center gap-2 font-black text-[#003366] dark:text-blue-400 mb-2 uppercase text-xs tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 1. Integrity Standards
            </h3>
            <p>
              As a study tool for the <strong>Junior Speller GH</strong>, users are expected to use this app without external dictionary aids to simulate real stage pressure.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-black text-[#003366] dark:text-blue-400 mb-2 uppercase text-xs tracking-wider">
              <Scale className="w-4 h-4" /> 2. The Spelling Law
            </h3>
            <ul className="list-disc pl-5 space-y-2 opacity-80">
              <li>Request pronunciation or definition via the provided buttons.</li>
              <li>You have 80 seconds per word.</li>
              <li>The digital judge's decision on the submitted string is final.</li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-black text-[#003366] dark:text-blue-400 mb-2 uppercase text-xs tracking-wider">
              <Info className="w-4 h-4" /> 3. Voice & Privacy
            </h3>
            <p className="opacity-80">
              We use your device's microphone for real-time transcription. Data is not stored. Progress is saved locally to your device.
            </p>
          </section>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onAccept}
            className="w-full bg-[#003366] dark:bg-blue-700 hover:bg-[#002244] dark:hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.97] uppercase tracking-widest text-sm"
          >
            I Accept & I Am Ready
          </button>
        </div>
      </div>
    </div>
  );
};