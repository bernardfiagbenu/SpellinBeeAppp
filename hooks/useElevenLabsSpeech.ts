import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData as decodePCM } from '../utils/audioUtils';

// Helper to get API key safely
const getApiKey = () => {
  return (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : '';
};

export const useElevenLabsSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.onended = null;
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speakWithGemini = async (text: string, onEnd?: () => void) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("API Key missing, falling back to browser TTS.");
      throw new Error("No API Key");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      // 'Puck' is selected for superior vowel-consonant separation on mobile speakers.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          parts: [{ 
            text: `Pronounce the word "${text}" as an official spelling bee judge. Speak slowly, clearly, and emphasize the syllables. Do not include extra commentary.` 
          }] 
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Puck' } 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio payload");

      const audioBytes = decodeBase64(base64Audio);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBuffer = await decodePCM(audioBytes, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.4; // High-definition boost for small mobile drivers
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      setIsSpeaking(true);
      source.start(0);
      currentSourceRef.current = source;
    } catch (e) {
      console.warn("Gemini TTS failed:", e);
      setIsSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; 
      utterance.onend = () => onEnd?.();
      window.speechSynthesis.speak(utterance);
    }
  };

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    stop();
    setIsGenerating(true);
    try {
      await speakWithGemini(text, onEnd);
    } finally {
      setIsGenerating(false);
    }
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating
  };
};