
export type HumanizationIntensity = 'Standard' | 'Advanced' | 'Ultra';
export type HumanizationPlatform = 'LinkedIn' | 'Email' | 'Direct Message' | 'Twitter/X' | 'Blog Post' | 'General';
export type HumanizationPersona = 'General' | 'Academic' | 'SEO Writer' | 'Founder' | 'Marketer' | 'Executive';
export type ReaderMood = 'Inspired' | 'Skeptical' | 'Bored' | 'Upset';
export type RefineStyle = 'Automatic' | 'Casual' | 'Professional' | 'Academic' | 'Storytelling';

export interface HumanizationVariations {
  essential: string;
  storyteller: string;
  visionary: string;
}

export interface Highlight {
  phrase: string;
  insight: string;
}

export interface AIPattern {
  phrase: string;
  reason: string;
}

export interface HumanizationResult {
  originalText: string;
  variations: HumanizationVariations;
  resonanceScores: Record<keyof HumanizationVariations, number>;
  highlights: Record<keyof HumanizationVariations, Highlight[]>;
  score: number;
  structuralChanges: string[];
  integrityPass?: boolean;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  isScanning: boolean;
  isScrambling: boolean;
}
