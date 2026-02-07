import { useState, useCallback, useRef } from 'react';

const ELEVEN_LABS_API_KEY = "ed720c4eba00f686859201fcc4c8b88a7ebc0e8a2e16136f8d836bc8ca378f6c";
const VOICE_ID = "pNInz6obpg8n9Y99RRGP"; // "Adam" - Very clear and authoritative

export const useElevenLabsSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    stop();
    setIsGenerating(true);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75, // Higher stability for clearer spelling
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsGenerating(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        setIsGenerating(false);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      await audio.play();

    } catch (error) {
      console.error("ElevenLabs TTS Error:", error);
      setIsGenerating(false);
      setIsSpeaking(false);
      // Fallback to browser TTS if ElevenLabs fails
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    }
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating
  };
};