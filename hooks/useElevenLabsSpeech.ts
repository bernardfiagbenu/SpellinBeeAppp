
import { useState, useCallback, useRef, useEffect } from 'react';

let activeUtterance: SpeechSynthesisUtterance | null = null;
let audioUnlocked = false;

/**
 * useElevenLabsSpeech (Native Edition)
 * Provides a high-reliability "Judge" voice using the browser's built-in speech engine.
 * @param customRate - Optional initial speech rate (default 0.85)
 */
export const useElevenLabsSpeech = (customRate: number = 0.85) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating] = useState(false); 

  const stop = useCallback(() => {
    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

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
    if (!('speechSynthesis' in window)) return;

    if (!audioUnlocked && !window.speechSynthesis.speaking) {
      console.debug("Speech deferred: Waiting for user interaction to unlock audio.");
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
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      if (event.error === 'not-allowed') {
        console.debug("Judge Voice: Playback not allowed yet (user gesture required).");
      } else if (event.error !== 'interrupted') {
        console.warn("Judge Voice Notice:", event.error);
      }
      setIsSpeaking(false);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [stop, customRate]);

  /**
   * Unlocks the speech synthesis engine. Must be called from a user gesture (e.g. click).
   */
  const initAudio = useCallback(() => {
    try {
      audioUnlocked = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        const silent = new SpeechSynthesisUtterance("");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
        console.debug("Audio engine unlocked for the Judge.");
      }
    } catch (e) {
      console.warn("Speech Synthesis Init failed (Safe to ignore if non-speech device):", e);
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
