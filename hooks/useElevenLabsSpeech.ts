
import { useState, useCallback, useRef, useEffect } from 'react';

let activeUtterance: SpeechSynthesisUtterance | null = null;
let audioUnlocked = false;
let resumeInterval: any = null;

/**
 * useElevenLabsSpeech (Native Edition)
 * Optimized for Android WebViews (Median.co/GoNative/APK wrappers).
 */
export const useElevenLabsSpeech = (customRate: number = 0.85) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating] = useState(false); 

  // Aggressively load voices for Android
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (resumeInterval) clearInterval(resumeInterval);
    // Android WebViews aggressively pause TTS to save power. 
    // This recursive resume keeps the engine "hot" during longer words.
    resumeInterval = setInterval(() => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
      }
    }, 1000); // 1s is more aggressive than 5s to ensure no dropouts
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (resumeInterval) {
      clearInterval(resumeInterval);
      resumeInterval = null;
    }
  }, []);

  const stop = useCallback(() => {
    stopHeartbeat();
    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
      activeUtterance.onstart = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [stopHeartbeat]);

  const getBestVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    return (
      voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
      voices.find(v => v.name.includes('David')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Full reset before each speech call
    stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = getBestVoice();
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = customRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      startHeartbeat();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      stopHeartbeat();
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      stopHeartbeat();
      // 'interrupted' is expected if we call stop() or speak() again
      if (event.error !== 'interrupted' && event.error !== 'not-allowed') {
        console.warn("Judge Voice (Native) Notice:", event.error);
      }
      setIsSpeaking(false);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;
    
    // Some Android WebView versions need an explicit resume after speak
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
  }, [stop, customRate, startHeartbeat, stopHeartbeat]);

  const initAudio = useCallback(() => {
    try {
      audioUnlocked = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        // Fire a zero-volume wake-up call to unlock audio context in WebView
        const silent = new SpeechSynthesisUtterance(" ");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
        window.speechSynthesis.resume();
        console.debug("Judge: Audio Context Handshake Successful.");
      }
    } catch (e) {
      console.warn("Speech Init Handshake failed:", e);
    }
  }, []);

  return {
    speak,
    stop,
    initAudio,
    isSpeaking,
    isGenerating
  };
};
