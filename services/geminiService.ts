import { GoogleGenAI, Type } from "@google/genai";
import { HumanizationIntensity, HumanizationPersona, HumanizationPlatform, ReaderMood, RefineStyle, HumanizationVariations, Highlight, AIPattern } from "../types";

export const detectAIPatterns = async (text: string): Promise<AIPattern[]> => {
  if (!text.trim()) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are an AI Detection Specialist. Identify up to 5 specific robotic hallmarks. Return JSON array of phrase/reason objects.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phrase: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["phrase", "reason"]
          }
        }
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Detection failed:", error);
    return [];
  }
};

export const humanizeText = async (
  text: string, 
  intensity: HumanizationIntensity, 
  persona: HumanizationPersona,
  platform: HumanizationPlatform,
  options: {
    styleSample?: string;
    naturalImperfections?: boolean;
    mood?: ReaderMood;
    refineStyle?: RefineStyle;
    keywords?: string;
  }
): Promise<{ variations: HumanizationVariations; resonanceScores: Record<keyof HumanizationVariations, number>; highlights: Record<keyof HumanizationVariations, Highlight[]>; score: number; changes: string[]; integrityPass: boolean }> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = `
# HEARTFELT AI MASTER ENGINE v2.0
## HUMANIZATION & PERSONALIZATION PROTOCOLS
CORE MISSION: Create authentic human prose and bypass AI detection.
- Perplexity Engineering & Burstiness Injection active.
- Preservation Engine: Preserve exact keywords: "${options.keywords || 'None'}".
- Style DNA Replication: Use sample DNA: "${options.styleSample || 'None'}".
- Parameters: Persona=${persona}, Platform=${platform}, Intensity=${intensity}, Mood=${options.mood || 'Natural'}.
OUTPUT: JSON including variations (essential, storyteller, visionary), highlights, scores, and integrity_pass.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.OBJECT,
              properties: {
                essential: { type: Type.STRING },
                storyteller: { type: Type.STRING },
                visionary: { type: Type.STRING }
              },
              required: ["essential", "storyteller", "visionary"]
            },
            resonance_scores: {
              type: Type.OBJECT,
              properties: {
                essential: { type: Type.INTEGER },
                storyteller: { type: Type.INTEGER },
                visionary: { type: Type.INTEGER }
              },
              required: ["essential", "storyteller", "visionary"]
            },
            highlights: {
              type: Type.OBJECT,
              properties: {
                essential: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phrase: { type: Type.STRING }, insight: { type: Type.STRING } } } },
                storyteller: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phrase: { type: Type.STRING }, insight: { type: Type.STRING } } } },
                visionary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phrase: { type: Type.STRING }, insight: { type: Type.STRING } } } }
              }
            },
            changes: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.INTEGER },
            integrity_pass: { type: Type.BOOLEAN }
          },
          required: ["variations", "resonance_scores", "highlights", "changes", "score", "integrity_pass"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    const finalPurify = (s: string) => (s || '').trim();

    return {
      variations: {
        essential: finalPurify(result.variations.essential),
        storyteller: finalPurify(result.variations.storyteller),
        visionary: finalPurify(result.variations.visionary)
      },
      resonanceScores: result.resonance_scores,
      highlights: result.highlights,
      score: result.score || 85,
      changes: result.changes || ["Harmonized rhythm"],
      integrityPass: result.integrity_pass ?? true
    };
  } catch (error) {
    console.error("Master Engine error:", error);
    throw new Error("Simulation failed. The engine is recalibrating.");
  }
};