import React from 'react';
import { ShieldCheck, Scale, Info, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  onAccept: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#003366] p-6 text-white shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-8 h-8 text-[#FFD700]" />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight">Competition Laws & Consent</h2>
          </div>
          <p className="text-blue-100 text-sm font-medium">Official Junior Speller GH Study Protocol</p>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-2 uppercase text-sm tracking-wider">
              <ShieldCheck className="w-4 h-4 text-green-600" /> 1. Competition Ethics
            </h3>
            <p className="text-sm">
              This application is a digital judge. Spellers are expected to maintain integrity. During study sessions, external aids (dictionaries, other devices) are discouraged to simulate real stage conditions.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-2 uppercase text-sm tracking-wider">
              <Scale className="w-4 h-4 text-blue-600" /> 2. Spelling Protocol
            </h3>
            <ul className="text-sm list-disc pl-5 space-y-2">
              <li>Spellers may request pronunciation, definition, and sentence use (Hint Feature).</li>
              <li>A speller has 80 seconds to complete a word.</li>
              <li>Once a letter is voiced, it cannot be changed. The judge evaluates the final submission string.</li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-2 uppercase text-sm tracking-wider">
              <Info className="w-4 h-4 text-amber-600" /> 3. Data Privacy & Consent
            </h3>
            <p className="text-sm">
              By proceeding, you consent to the use of your device's microphone for voice-to-text processing. This data is processed locally/via secure API and is not permanently stored or shared with third parties. Your progress is cached in your browser's local storage for your convenience.
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={onAccept}
            className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-6 h-6 text-[#FFD700]" />
            AGREE & ENTER STAGE
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">
            Authorized Digital Companion for Junior Speller GH
          </p>
        </div>
      </div>
    </div>
  );
};