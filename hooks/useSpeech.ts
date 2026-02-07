
import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Function to get a good quality voice from the browser's list
    const getVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;

        // Prefer a "Google" voice if available, as they are often higher quality.
        let voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
        if (voice) return voice;
        
        // Fallback to a Microsoft voice
        voice = voices.find(v => v.name.includes('David') || v.name.includes('Zira'));
        if (voice) return voice;

        // Fallback to the first available US English voice.
        voice = voices.find(v => v.lang === 'en-US');
        if (voice) return voice;

        // Fallback to any English voice.
        voice = voices.find(v => v.lang.startsWith('en'));
        return voice || voices[0];
    }, []);
    
    // Ensure voices are loaded. Some browsers load them asynchronously.
    useEffect(() => {
        const onVoicesChanged = () => { /* just to trigger voice loading */ };
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
        // Pre-emptively load voices
        window.speechSynthesis.getVoices();
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        };
    }, []);

    const stop = useCallback(() => {
        if (utteranceRef.current) {
            utteranceRef.current.onend = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        // Stop any currently speaking utterance before starting a new one.
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        utterance.voice = getVoice();
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // A little slower for better clarity in a spelling context
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);

        utterance.onend = () => {
            setIsSpeaking(false);
            utteranceRef.current = null;
            if (onEnd) onEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            setIsSpeaking(false);
            utteranceRef.current = null;
             if (onEnd) onEnd(); // Call onEnd to not block UI flow
        }

        window.speechSynthesis.speak(utterance);

    }, [stop, getVoice]);

    // This function adapts to the flexible call signature used in SpellingGame.tsx,
    // which sometimes passes a function as the second argument.
    const flexibleSpeak = useCallback((text: string, rateOrOnEnd?: number | (() => void), onEnd?: () => void) => {
        let endCallback: (() => void) | undefined;
        if (typeof rateOrOnEnd === 'function') {
            endCallback = rateOrOnEnd;
        } else if (typeof onEnd === 'function') {
            endCallback = onEnd;
        }
        speak(text, endCallback);
    }, [speak]);

    return { 
        speak: flexibleSpeak,
        stop, 
        isSpeaking,
    };
};
