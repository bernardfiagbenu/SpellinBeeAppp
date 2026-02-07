import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData as decodePCM } from '../utils/audioUtils';

// Legacy name kept for compatibility, but powered by the ultimate Gemini TTS engine.
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
    if (!ai) throw new Error("AI not ready");

    try {
      // 'Puck' is the ultimate free voice for clarity. 
      // We instruct the AI to act as a phonetics expert to ensure tricky letters are distinct.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          parts: [{ 
            text: `As an official International Spelling Bee judge and phonetics expert, pronounce the word "${text}" extremely clearly. Emphasize every syllable and ensure consonants are sharp and distinct. Speak slowly.` 
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
      if (!base64Audio) throw new Error();

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
      gainNode.gain.value = 1.3; // Extra clarity boost for mobile environments
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