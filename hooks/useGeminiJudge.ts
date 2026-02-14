import { GoogleGenAI } from "@google/genai";

export const useGeminiJudge = () => {
  const getSpellingTip = async (word: string) => {
    // Strictly using process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a very short, clever mnemonic device or a specific spelling rule for the word "${word}". Keep it under 15 words and very encouraging for a young student.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text;
    } catch (e) {
      console.error("Gemini Hint Error", e);
      return "Focus on each syllable and sound it out slowly!";
    }
  };

  return { getSpellingTip };
};