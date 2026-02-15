
import { useState, useCallback, useRef, useEffect } from 'react';

let activeUtterance: SpeechSynthesisUtterance | null = null;
let resumeInterval: any = null;

/**
 * useElevenLabsSpeech (Native Edition)
 * Specifically hardened for Android WebView (Median.co/GoNative).
 */
export const useElevenLabsSpeech = (customRate: number = 0.85) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating] = useState(false); 

  // Aggressive voice loading for APKs
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
    // Recursive resume to keep the engine active in WebView
    resumeInterval = setInterval(() => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
      }
    }, 1000); 
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
      if (event.error !== 'interrupted' && event.error !== 'not-allowed') {
        console.warn("Judge Voice (Native) Notice:", event.error);
      }
      setIsSpeaking(false);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;
    
    window.speechSynthesis.speak(utterance);
    // Critical: Resume immediately for Android
    window.speechSynthesis.resume();
  }, [stop, customRate, startHeartbeat, stopHeartbeat]);

  const initAudio = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        // 1. Play a tiny silent MP3 to warm up Android Audio Session
        // This is often required by WebView wrappers to allow any TTS/Audio
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        silentAudio.play().catch(() => {});
        
        // 2. Warm up TTS engine
        window.speechSynthesis.getVoices();
        const silent = new SpeechSynthesisUtterance(" ");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
        window.speechSynthesis.resume();
        console.debug("Judge: Audio Channel Primed.");
      }
    } catch (e) {
      console.warn("Speech Warmup failed:", e);
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
