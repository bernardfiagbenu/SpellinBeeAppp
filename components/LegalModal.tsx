
import React, { useState } from 'react';
import { ShieldCheck, Scale, Info, Loader2 } from 'lucide-react';
import { useElevenLabsSpeech } from '../hooks/useElevenLabsSpeech';

interface LegalModalProps {
  onAccept: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onAccept }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const logoUrl = "https://juniorspellergh.com/wp-content/uploads/2024/01/3d-junior-speller-logo-2048x1172.png";
  const { initAudio } = useElevenLabsSpeech();

  const handleAccept = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // We use a small timeout to allow the UI to update to 'Verifying...' state
    // and to ensure initAudio doesn't block the main thread in a way that
    // stops the modal from closing.
    setTimeout(() => {
      try {
        initAudio();
      } catch (e) {
        console.error("Audio initialization error in LegalModal:", e);
      } finally {
        // Crucial: We call onAccept regardless of whether initAudio succeeded
        // to prevent the user from getting stuck on the screen.
        onAccept();
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors border-t-8 border-jsGold">
        <div className="p-8 flex flex-col items-center bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
           <img 
            src={logoUrl} 
            alt="Junior Speller Logo" 
            className="h-20 sm:h-24 w-auto mb-4 object-contain"
          />
          <h2 className="text-xl font-black text-black dark:text-jsGold uppercase tracking-tight text-center">Competition Protocol</h2>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[13px] sm:text-sm">
          <section className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="flex items-center gap-2 font-black text-black dark:text-jsGold mb-2 uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 1. Anonymous Identity
            </h3>
            <p>
              To track your global ranking fairly, a unique anonymous speller ID is assigned to this device. No personal data is required or stored.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-black text-black dark:text-jsGold mb-2 uppercase text-[10px] tracking-wider">
              <Scale className="w-4 h-4" /> 2. Fair Play
            </h3>
            <ul className="list-disc pl-5 space-y-2 opacity-80 font-medium">
              <li>External aids are prohibited during active sessions.</li>
              <li>Timer pressure simulates real stage conditions.</li>
              <li>Global rankings are updated based on accuracy and speed.</li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-black text-black dark:text-jsGold mb-2 uppercase text-[10px] tracking-wider">
              <Info className="w-4 h-4" /> 3. Voice Logic
            </h3>
            <p className="opacity-80 font-medium">
              Voice mode processes audio locally for the fastest response. The Judge is digital and its decision on spellings is based on official Word of Champions data.
            </p>
          </section>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className={`w-full bg-black dark:bg-jsGold text-jsGold dark:text-black font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.97] uppercase tracking-widest text-xs sm:text-sm ${isProcessing ? 'opacity-80 cursor-wait' : 'cursor-pointer'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Protocol...
              </>
            ) : (
              'Enter The Competition'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
