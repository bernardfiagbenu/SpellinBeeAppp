
import { useState, useCallback, useRef, useEffect } from 'react';
import { AUDIO_BASE_URL, USE_REMOTE_AUDIO } from '../constants';

export const useSpeech = (speechRate = 1) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsSpeaking(false);
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        stop();
        
        // Clean the word for the filename (lowercase, no spaces)
        const fileName = text.toLowerCase().trim().replace(/\s+/g, '_');
        
        let audioPath = `/audio/${fileName}.mp3`;
        if (USE_REMOTE_AUDIO && AUDIO_BASE_URL) {
            // Ensure trailing slash on base URL
            const baseUrl = AUDIO_BASE_URL.endsWith('/') ? AUDIO_BASE_URL : `${AUDIO_BASE_URL}/`;
            audioPath = `${baseUrl}${fileName}.mp3`;
        }
        
        const audio = new Audio(audioPath);
        audio.playbackRate = speechRate;
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        
        audio.onerror = () => {
            console.warn(`Audio file not found: ${audioPath}. Falling back to browser TTS.`);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speechRate;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                if (onEnd) onEnd();
            };
            window.speechSynthesis.speak(utterance);
        };

        audio.play().catch(err => {
            console.error("Playback failed", err);
            // If play fails (e.g. not allowed), try TTS immediately as fallback
            if (audio.onerror) audio.onerror(new Event('error'));
        });

    }, [stop, speechRate]);

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
