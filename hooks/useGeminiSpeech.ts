
import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';

// Initialize the Gemini AI client. The API Key is expected to be in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const useGeminiSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null; // Prevent onended from firing on manual stop
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Can throw if already stopped, ignore.
      }
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    stop(); // Stop any currently playing audio
    setIsGenerating(true);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                // A clear, neutral voice suitable for a spelling bee
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received from Gemini API.");
      }

      const audioBytes = decodeBase64(base64Audio);

      if (!audioContextRef.current) {
        // Gemini TTS provides audio at a 24000 sample rate
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Use the custom decoder for raw PCM audio data
      const audioBuffer = await decodeAudioData(
        audioBytes,
        audioContextRef.current,
        24000, // Gemini TTS sample rate
        1,     // Mono channel
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        currentSourceRef.current = null;
      };

      setIsGenerating(false);
      setIsSpeaking(true);
      source.start();
      currentSourceRef.current = source;

    } catch (error) {
      console.error("Gemini TTS Error:", error);
      setIsGenerating(false);
      setIsSpeaking(false);
      if (onEnd) onEnd(); // Ensure UI doesn't hang on error
    }
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isGenerating
  };
};
