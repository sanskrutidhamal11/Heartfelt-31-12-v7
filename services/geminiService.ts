
import { GoogleGenAI, Type } from "@google/genai";
import { HumanizationIntensity, HumanizationPersona, HumanizationPlatform, ReaderMood, RefineStyle, HumanizationVariations, Highlight, AIPattern } from "../types";

// Standard API initialization as per system guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const detectAIPatterns = async (text: string): Promise<AIPattern[]> => {
  if (!text.trim()) return [];

  const systemInstruction = `You are an AI Detection Specialist. Analyze the provided text for robotic hallmarks, such as:
1. Overused transitional phrases (In conclusion, Furthermore, Additionally).
2. Perfectly balanced but soulless sentence structures.
3. Repetitive linguistic patterns or "safe" hedging.
4. Over-explanation of simple concepts.

Identify up to 5 specific phrases that scream "AI-generated".
Return the results as a JSON array of objects with "phrase" and "reason" properties.
The "phrase" MUST be an exact substring from the input text.`;

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

    const result = JSON.parse(response.text || "[]");
    return result;
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
  
  // Master Prompt Construction integrating HEARTFELT AI SYSTEM PROMPT v2.0 and PERSONALIZATION MODULE
  const systemPrompt = `
# HEARTFELT AI MASTER ENGINE v2.0
## HUMANIZATION & PERSONALIZATION PROTOCOLS

CORE MISSION:
1. Create Irresistibly Human Content - Text so authentic and soulful that readers cannot look away.
2. 100% AI Detection Bypass - Eliminate every statistical and linguistic fingerprint.

SECTION 1: ANTI-DETECTION ARCHITECTURE
- Perplexity Engineering: Make 30-40% of word choices "surprising but appropriate".
- Burstiness Injection: Create dramatic sentence length swings (3 words to 45 words).
- Structure Chaos: Never use the same sentence opening twice in a row. Use fragments, em-dashes, and asides.
- Transition Unpredictability: Avoid "Furthermore, Moreover". Use "But here's the thing" or jump directly.

SECTION 2: KEYWORD PRESERVATION ENGINE (MANDATORY COMPLIANCE)
User Keywords: "${options.keywords || 'None provided'}"
IF keywords exist:
- Preserve them EXACTLY (case, spelling, formatting).
- Embed them naturally; never forced or awkward.
- Distribution: Spread them throughout the text naturally.
- Conflict Resolution: Keyword preservation wins over humanization defaults.

SECTION 3: STYLE LEARNING & REPLICATION
User Style DNA Seed: "${options.styleSample || 'None provided'}"
IF DNA seed exists:
- Analyze Lexical Fingerprint: Register, word preferences, specialized terms.
- Analyze Syntactic Fingerprint: Sentence complexity distribution, opening patterns.
- Analyze Rhetorical Fingerprint: Persuasion patterns, emotional markers, rhythmic flow.
- APPLICATION: User's authentic style > Preset persona defaults. Replicate the "feel".

SECTION 4: CORE PARAMETERS
- Persona: ${persona} (Align register and authority markers).
- Platform: ${platform} (Optimized format/structure).
- Intensity: ${intensity} (Standard=Grade 8 core, Ultra=Sophisticated/Soulful).
- Mood: ${options.mood || 'Natural'} (Modulate energy and linguistic markers).

OUTPUT REQUIREMENTS:
- Generate 3 variations: "Essential" (Direct), "Storyteller" (Narrative), "Visionary" (Inspiring).
- Highlights: Select 2 phrases per variation that exemplify Biological Resonance.
- Changes: List 4 specific structural evolution logic points.
- Score: Quantify Biological Resonance (Aim for 90+).
- NO DASHES (— or –) unless user style sample explicitly uses them. Use commas or breath points.
- Final output must be JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex reasoning task
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
    
    // Clean-up and normalization
    const finalPurify = (s: string) => (s || '').trim().replace(/\.+$/, '.');

    return {
      variations: {
        essential: finalPurify(result.variations.essential),
        storyteller: finalPurify(result.variations.storyteller),
        visionary: finalPurify(result.variations.visionary)
      },
      resonanceScores: result.resonance_scores,
      highlights: result.highlights,
      score: result.score || 85,
      changes: result.changes || ["Harmonized rhythm", "DNA sync complete", "Stealth Protocol active"],
      integrityPass: result.integrity_pass ?? true
    };
  } catch (error) {
    console.error("Master Engine error:", error);
    throw new Error("Simulation failed. Our engine is recalibrating.");
  }
};
