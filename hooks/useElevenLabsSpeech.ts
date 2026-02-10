import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useElevenLabsSpeech (Native Edition)
 * Provides a high-reliability "Judge" voice using the browser's built-in speech engine.
 */
export const useElevenLabsSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating] = useState(false); // No longer needed for native, kept for compat
  const voicesLoadedRef = useRef(false);

  // Pre-load voices for snappier response
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      voicesLoadedRef.current = true;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Priority list for clarity: Google US, Microsoft David, any US English
    return (
      voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
      voices.find(v => v.name.includes('David')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const speak = useCallback((text: string, onEnd?: () => void) => {
    stop();
    
    // Create the "Judge" persona
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getBestVoice();
    utterance.rate = 0.85; // Slightly slower for spelling clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, [stop]);

  // Compatibility method for the LegalModal warm-up
  const initAudio = useCallback(() => {
    window.speechSynthesis.getVoices();
    // On some browsers, speaking a silent string "unlocks" the audio
    const silent = new SpeechSynthesisUtterance("");
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
  }, []);

  return {
    speak,
    stop,
    initAudio,
    isSpeaking,
    isGenerating
  };
};