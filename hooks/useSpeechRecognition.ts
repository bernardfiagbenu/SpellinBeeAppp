import { useState, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    // @ts-ignore - SpeechRecognition is not standard in all TS environments yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Browser not supported. Please use Google Chrome or MS Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition warning/error:", event.error);
      
      if (event.error === 'no-speech') {
        // Soft error: just stop listening, don't scare the user.
        // They likely just didn't say anything in time.
        setError('Timed out. Click mic to try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied.');
      } else if (event.error === 'network') {
        setError('Network error. Check connection.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start recognition", error);
      setError("Could not start microphone.");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    // We rely on the browser's auto-stop for 'continuous: false', 
    // but this can be expanded if manual stop is needed.
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
       // Logic to force stop if needed, though typically we just let state sync
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return { 
    isListening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening,
    resetTranscript,
    error
  };
};