import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData as decodePCM } from '../utils/audioUtils';

const ELEVEN_LABS_API_KEY = "ed720c4eba00f686859201fcc4c8b88a7ebc0e8a2e16136f8d836bc8ca378f6c";
const VOICE_ID = "pNInz6obpg8n9Y99RRGP"; 

// Initialize Gemini as the primary reliable free TTS engine
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const useElevenLabsSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speakWithGemini = async (text: string, onEnd?: () => void) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error();

      const audioBytes = decodeBase64(base64Audio);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBuffer = await decodePCM(audioBytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      setIsSpeaking(true);
      source.start();
      currentSourceRef.current = source;
    } catch (e) {
      // Final silent fallback to browser engine if both cloud services are unreachable
      setIsSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    }
  };

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    stop();
    setIsGenerating(true);

    try {
      // Attempt Gemini first as the reliable free-tier choice
      await speakWithGemini(text, onEnd);
      setIsGenerating(false);
    } catch (error) {
      // Silent attempt at ElevenLabs if Gemini fails for some reason
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
            voice_settings: { stability: 0.75, similarity_boost: 0.75 },
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onplay = () => { setIsGenerating(false); setIsSpeaking(true); };
          audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); if (onEnd) onEnd(); };
          await audio.play();
        } else {
          throw new Error();
        }
      } catch (e) {
        setIsGenerating(false);
        onEnd?.();
      }
    }
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating
  };
};