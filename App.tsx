
// FIX: Corrected the React import statement to properly import hooks and resolve numerous 'not defined' errors throughout the component.
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Fingerprint, Trash2, ArrowRight, Info, Clock, AlertCircle, Linkedin, Instagram, Settings2, Search, X, ShieldCheck, Scale, Mail, FileText, Heart, Lock, Pen, ChevronDown, Smile, Globe, LoaderCircle, CheckCircle2 } from 'lucide-react';
import HumanScoreRing from './components/HumanScoreRing';
import { detectAIPatterns, humanizeText } from './services/geminiService';
import { HumanizationResult, ProcessingState, HumanizationIntensity, HumanizationPersona, HumanizationPlatform, ReaderMood, HumanizationVariations, AIPattern } from './types';
// Import the CSS file
import './App.css';

const MOOD_CONFIG: Record<ReaderMood, { icon: string, label: string, color: string, glow: string }> = {
  'Inspired': { icon: '😍', label: 'Inspired', color: 'bg-amber-50 text-amber-700 border-amber-100', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-400/50' },
  'Skeptical': { icon: '🧐', label: 'Skeptical', color: 'bg-sky-50 text-sky-700 border-sky-100', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)] border-sky-400/50' },
  'Bored': { icon: '😴', label: 'Bored', color: 'bg-slate-50 text-slate-700 border-slate-100', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)] border-slate-400/50' },
  'Upset': { icon: '😤', label: 'Upset', color: 'bg-rose-50 text-rose-700 border-rose-100', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-400/50' }
};

const INTENSITY_DESCRIPTIONS: Record<HumanizationIntensity, string> = {
  'Standard': 'Foundational Resonance. Refines grammar and flow while preserving original structure.',
  'Advanced': 'Deep Pulse Integration. Infuses the text with emotional nuance and varied sentence rhythms.',
  'Ultra': 'The Visionary Leap. Complete structural evolution to find the deepest human soul and resonance.'
};

// Define the liquid gold gradient SVG string for reuse with three stops
const LIQUID_GOLD_GRADIENT_SVG = `
  <linearGradient id="liquid-gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stopColor="#D4AF37" />
    <stop offset="50%" stopColor="#F1D592" />
    <stop offset="100%" stopColor="#AF8C24" />
  </linearGradient>
`;

const DivineHeartIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`animate-heart-pulse-premium ${className}`}
    style={{ 
      width: 'auto', 
      height: '0.6em', 
      display: 'inline-block', 
      verticalAlign: 'baseline', 
      transform: 'translateY(0.1em)', // Adjusted for pixel-perfect baseline alignment
      filter: 'drop-shadow(0 0 15px rgba(255, 102, 178, 0.9))' // Deep Rose Gold glow, increased spread
    }}
  >
    <defs dangerouslySetInnerHTML={{ __html: LIQUID_GOLD_GRADIENT_SVG }} />
    <path fill="url(#liquid-gold-gradient)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const ButtonHeartIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`w-5 h-5 transition-transform ${className}`}
  >
    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// Dropdown component for Persona, Emotion, Strength
const Dropdown: React.FC<{
  label: string;
  options: { value: string; label: string | React.ReactNode }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  headerIcon?: React.ReactNode;
  headerClasses?: string;
}> = ({ label, options, selectedValue, onSelect, headerIcon, headerClasses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = options.find(opt => opt.value === selectedValue)?.label || label;

  return (
    <div className="relative flex-grow" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 text-xs sm:text-sm font-bold transition-colors ${headerClasses}`}
      >
        <div className="flex items-center gap-3">
          {headerIcon && <span>{headerIcon}</span>}
          {currentLabel}
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-[9999] bg-[#1A1A1A] rounded-2xl shadow-xl border border-white/40 min-w-[240px] p-2 animate-fade-in-up">
          <p className="text-[9px] font-black uppercase tracking-widest text-white px-3 pb-2 border-b border-gray-700 mb-2">{label}</p>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-base font-medium transition-all flex items-center gap-2 ${selectedValue === option.value ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

type ValidationState = 'idle' | 'loading' | 'checked';

const ValidationMetric: React.FC<{ label: string; state: ValidationState }> = ({ label, state }) => {
  if (state === 'idle') return null;

  return (
    <div className="flex items-center gap-3 text-gray-800 animate-fade-in-up">
      {state === 'loading' && <LoaderCircle size={14} className="animate-spin text-gray-400" />}
      {state === 'checked' && <CheckCircle2 size={14} className="text-green-500" />}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
};

type AppView = 'input' | 'processing' | 'output';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState<HumanizationPersona | null>(null);
  const [platform, setPlatform] = useState<HumanizationPlatform | null>(null);
  const [mood, setMood] = useState<ReaderMood | null>(null);
  const [intensity, setIntensity] = useState<HumanizationIntensity | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<keyof HumanizationVariations>('essential');
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [status, setStatus] = useState<ProcessingState>({ 
    isLoading: false, 
    error: null, 
    isScanning: false, 
    isScrambling: false 
  });
  const [detectedPatterns, setDetectedPatterns] = useState<AIPattern[]>([]);
  const [copied, setCopied] = useState(false);
  const [styleSample, setStyleSample] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false);
  const [isPersonalizationDrawerOpen, setIsPersonalizationDrawerOpen] = useState(false);
  const [meaningCheckState, setMeaningCheckState] = useState<ValidationState>('idle');
  const [originalityCheckState, setOriginalityCheckState] = useState<ValidationState>('idle');

  const [currentView, setCurrentView] = useState<AppView>('input');

  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && currentView === 'output') {
      setMeaningCheckState('loading');
      setOriginalityCheckState('loading');

      const timer = setTimeout(() => {
        setMeaningCheckState('checked');
        setOriginalityCheckState('checked');
      }, 1800);

      return () => clearTimeout(timer);
    } else {
      setMeaningCheckState('idle');
      setOriginalityCheckState('idle');
    }
  }, [result, currentView]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
        highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const inputWordCount = useMemo(() => input.trim() ? input.trim().split(/\s+/).length : 0, [input]);
  const outputText = result ? result.variations[selectedVariation] : '';
  const outputWordCount = useMemo(() => outputText.trim() ? outputText.trim().split(/\s+/).length : 0, [outputText]);
  
  const readingTime = useMemo(() => {
    if (outputWordCount === 0) return 0;
    return Math.max(1, Math.ceil(outputWordCount / 238));
  }, [outputWordCount]);

  const handleScan = async () => {
    if (!input.trim() || status.isScanning) return;
    setStatus(prev => ({ ...prev, isScanning: true }));
    setDetectedPatterns([]);
    
    try {
      const patterns = await detectAIPatterns(input);
      setDetectedPatterns(patterns);
    } catch (err) {
      console.error("Scanning failed:", err);
    } finally {
      setStatus(prev => ({ ...prev, isScanning: false }));
    }
  };

  const handleHumanize = async () => {
    if (!input.trim() || status.isLoading) return;

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setResult(null); // Clear previous results

    setCurrentView('processing'); // Immediately switch to processing view

    const minVisualLoadTime = 1500; // Minimum 1.5 seconds for the high-end loading animation
    const apiCallStartTime = Date.now();

    try {
      const currentPersona = persona || 'General'; 
      const currentPlatform = platform || 'General';
      const currentIntensity = intensity || 'Standard'; 
      const currentMood = mood || undefined; 

      const dataPromise = humanizeText(input, 
        currentIntensity, 
        currentPersona,
        currentPlatform, 
        {
          styleSample,
          keywords,
          mood: currentMood,
        }
      );

      // Wait for both the API call and the minimum loading animation time
      const [data] = await Promise.all([
        dataPromise,
        new Promise(resolve => setTimeout(resolve, minVisualLoadTime)),
      ]);

      setResult({
        originalText: input,
        variations: data.variations,
        resonanceScores: data.resonanceScores,
        highlights: data.highlights,
        score: data.score,
        structuralChanges: data.changes,
        integrityPass: data.integrityPass
      });
      setStatus(prev => ({ ...prev, isLoading: false, error: null }));
      setCurrentView('output'); // Switch to output view
    } catch (err: any) {
      console.error("Simulation failed:", err);
      setStatus(prev => ({ ...prev, isLoading: false, error: err.message || "Simulation failed." }));
      setCurrentView('input'); // On error, go back to input.
    }
  };

  const handleStartOver = () => {
    setResult(null); // Clear previous results
    setStatus(prev => ({ ...prev, isLoading: false, error: null })); // Reset status before transition
    setCurrentView('processing'); // Transition to processing briefly (to animate output out)

    const transitionDelay = 500; // Matches CSS transition duration

    setTimeout(() => {
      setInput(''); // Clear input for a fresh start
      setDetectedPatterns([]); // Clear any detected patterns
      setIsInsightsDrawerOpen(false); // Close drawer on reset
      setCurrentView('input'); // Switch to input view
    }, transitionDelay);
  };

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputText]);

  const renderHighlightedInput = () => {
    if (detectedPatterns.length === 0) return input;

    let highlightedText: (string | React.ReactNode)[] = [input];

    detectedPatterns.forEach((pattern) => {
      const phrase = pattern.phrase;
      if (!phrase) return;

      const newHighlightedText: (string | React.ReactNode)[] = [];
      highlightedText.forEach((part) => {
        if (typeof part !== 'string') {
          newHighlightedText.push(part);
          return;
        }

        const segments = part.split(phrase);
        segments.forEach((segment, idx) => {
          newHighlightedText.push(segment);
          if (idx < segments.length - 1) {
            newHighlightedText.push(
              <span key={pattern.phrase + idx} className="relative group/robotic inline-block">
                <span className="border-b-2 border-orange-400/60 cursor-help bg-orange-50/30">
                  {phrase}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/robotic:opacity-100 transition-all duration-300 pointer-events-none z-50 transform translate-y-2 group-hover/robotic:translate-y-0">
                  <div className="w-56 p-3 bg-white/90 backdrop-blur-md border border-orange-200 rounded-xl shadow-xl text-[10px] text-orange-900 leading-tight">
                    <div className="flex items-center gap-1.5 mb-1 font-black uppercase tracking-widest text-[8px] text-orange-400">
                      <AlertCircle size={10} /> Robotic Hallmark
                    </div>
                    {pattern.reason}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/90"></div>
                  </div>
                </div>
              </span>
            );
          }
        });
      });
      highlightedText = newHighlightedText;
    });

    return highlightedText;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1F] transition-colors duration-500">
      <nav className="fixed top-0 w-full glass-nav z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tight font-serif-premium">Heartfelt</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        {/* Hero Section - High Fidelity Native Styling */}
        <center>
          <div className="mb-8 flex items-center justify-center gap-2 px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm animate-fade-in-up">
            <Sparkles size={12} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">The Gold Standard of Human Resonance</span>
          </div>

          <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 font-serif-premium">
              Words with a <span className="inline-flex items-baseline">S<DivineHeartIcon className="mx-[0.02em]" />ul</span>.
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed text-[#1D1D1F] font-bold">
              We turn robotic, AI-generated text into soulful, human content.
            </p>
          </section>
        </center>

        {/* Dynamic Content Area: Input Lab / Loading / Output Lab */}
        <div className="relative w-full mb-10">
          {currentView === 'input' && (
            <div className="w-full bg-white rounded-[3rem] p-4 md:p-6 apple-shadow flex flex-col animate-fade-in-scale-up transition-all duration-400 ease-out">
              {/* Control Bar */}
              <div className="relative z-20 flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-lg rounded-2xl border border-white/40 mb-6">
                <div className="flex-1 flex flex-wrap items-center gap-3">
                  <Dropdown
                    label="Persona"
                    options={(['General', 'Academic', 'SEO Writer', 'Founder', 'Marketer', 'Executive'] as HumanizationPersona[]).map(p => ({ value: p, label: p }))}
                    selectedValue={persona}
                    onSelect={(value) => setPersona(value as HumanizationPersona)}
                    headerIcon={<Fingerprint size={16} />}
                    headerClasses="bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200/70"
                  />
                  <Dropdown
                    label="Platform"
                    options={(['LinkedIn', 'Email', 'Direct Message', 'Twitter/X', 'Blog Post', 'General'] as HumanizationPlatform[]).map(p => ({ value: p, label: p }))}
                    selectedValue={platform}
                    onSelect={(value) => setPlatform(value as HumanizationPlatform)}
                    headerIcon={<Globe size={16} />}
                    headerClasses="bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200/70"
                  />
                  <Dropdown
                    label="Emotion"
                    options={(Object.keys(MOOD_CONFIG) as ReaderMood[]).map(m => ({ value: m, label: <span className="flex items-center gap-2">{MOOD_CONFIG[m].icon} {MOOD_CONFIG[m].label}</span> }))}
                    selectedValue={mood}
                    onSelect={(value) => setMood(value as ReaderMood)}
                    headerIcon={<Heart size={16} />}
                    headerClasses="bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200/70"
                  />
                  <Dropdown
                    label="Strength"
                    options={(['Standard', 'Advanced', 'Ultra'] as HumanizationIntensity[]).map(i => ({ value: i, label: i }))}
                    selectedValue={intensity}
                    onSelect={(value) => setIntensity(value as HumanizationIntensity)}
                    headerIcon={<Settings2 size={16} />}
                    headerClasses="bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200/70"
                  />
                </div>
                
                <div className="w-full flex justify-center pt-2">
                  <button
                    onClick={() => setIsPersonalizationDrawerOpen(!isPersonalizationDrawerOpen)}
                    className="text-sm text-yellow-600 font-serif-premium italic font-medium transition-colors hover:text-yellow-500 flex items-center gap-2"
                  >
                    Personalization Options
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isPersonalizationDrawerOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPersonalizationDrawerOpen ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                  <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                    <div className="relative w-full">
                      <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Keywords to Preserve (e.g., HeartfeltAI, v8.0)"
                        className="w-full bg-white border-2 border-slate-200 rounded-full py-3 pl-12 pr-5 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      />
                    </div>
                    <div className="relative w-full">
                      <Pen size={14} className="absolute left-5 top-5 text-gray-400 pointer-events-none" />
                      <textarea
                        value={styleSample}
                        onChange={(e) => setStyleSample(e.target.value)}
                        placeholder="Paste a few sentences you wrote yourself. This helps the AI learn your style and write just like you."
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-5 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all no-scrollbar resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative w-full bg-white/50 rounded-[1.5rem] border border-gray-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-500 focus-within:border-amber-300 focus-within:bg-white">
                <div 
                  ref={highlightRef}
                  className={`absolute inset-0 text-2xl font-medium leading-relaxed whitespace-pre-wrap pointer-events-none transition-opacity duration-300 overflow-y-auto no-scrollbar ${detectedPatterns.length > 0 ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden="true"
                >
                  <div className="text-transparent p-8 pb-12">
                    {renderHighlightedInput()}
                  </div>
                </div>

                <textarea
                  value={input}
                  onScroll={handleScroll}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (detectedPatterns.length > 0) setDetectedPatterns([]);
                  }}
                  placeholder="Paste AI content..."
                  className="w-full min-h-[300px] md:min-h-[350px] text-2xl font-medium text-[#1A1A1A] leading-relaxed outline-none resize-none placeholder:text-gray-200 bg-transparent relative z-10 selection:bg-blue-100 p-8 pb-12 no-scrollbar"
                />
                
                <div className="absolute bottom-0 left-0 right-0 px-8 pb-4 z-20 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-2 pointer-events-none">
                  <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{inputWordCount} words</span>
                      {detectedPatterns.length > 0 && (
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest animate-fade-in-up flex items-center gap-1">
                          <AlertCircle size={10} /> {detectedPatterns.length} Robotisms Found
                        </span>
                      )}
                  </div>

                  <button 
                      onClick={() => { setInput(''); setDetectedPatterns([]); }}
                      className="p-2.5 text-gray-300 hover:text-red-500 transition-colors bg-white/50 rounded-full border border-white/20 pointer-events-auto"
                  >
                      <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'processing' && (
            <div className="w-full bg-white rounded-[3rem] p-4 md:p-6 apple-shadow flex justify-center items-center animate-fade-in-scale-up" style={{ minHeight: '400px' }}>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-gold-aura-pulse shadow-md">
                 <DivineHeartIcon className="!h-10 !w-10 text-yellow-500" />
              </div>
            </div>
          )}
          
          {currentView === 'output' && (
            <div className="animate-fade-in-scale-up">
              <div className="w-full bg-white rounded-[3rem] py-4 md:py-6 apple-shadow pb-10">
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 mb-4 px-5">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-[12px] h-[12px] rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] ${status.isLoading ? 'animate-pulse' : ''}`}
                        style={{ transition: 'transform 0.3s ease-out', transform: result ? 'scale(1.15)' : 'scale(1)' }}
                      ></div>
                      <h3 className="text-sm font-bold text-black tracking-wide">REFINED OUTPUT</h3>
                    </div>
                    {result && (
                      <div className="w-full sm:w-auto flex items-center justify-around sm:justify-start gap-1 p-1 bg-gray-50 rounded-full">
                        {(['essential', 'storyteller', 'visionary'] as (keyof HumanizationVariations)[]).map(v => (
                          <button
                            key={v}
                            onClick={() => setSelectedVariation(v)}
                            className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${selectedVariation === v ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {v.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {result ? (
                    <>
                      <div className="px-5">
                         <div className="relative group w-full h-[300px] md:h-[450px] bg-white/50 backdrop-blur-sm border border-gray-200/80 rounded-[1.5rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                          <div className="h-full w-full overflow-y-auto no-scrollbar rounded-[1.5rem] p-8">
                            <p className="text-2xl leading-relaxed text-[#1A1A1A] whitespace-pre-wrap">
                               {result.variations[selectedVariation]}
                            </p>
                          </div>
                          <div className="absolute bottom-8 right-8 flex items-center gap-3 z-20">
                            {copied && (
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest animate-fade-in-up bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                                Copied!
                              </span>
                            )}
                            <button 
                              onClick={handleCopy} 
                              className={`p-3.5 rounded-full transition-all duration-300 shadow-xl relative overflow-hidden group/copy backdrop-blur-lg border border-white/40 ${copied ? 'bg-green-500/80 text-white scale-110 shadow-green-100' : 'bg-white/40 text-gray-500 hover:text-black hover:scale-110 hover:shadow-xl hover:shadow-yellow-100/50'}`}
                            >
                              <div className={`transition-all duration-500 ${copied ? 'scale-110 rotate-[360deg]' : 'scale-100 rotate-0'}`}>
                                {copied ? <Check size={18} className="animate-bounce" /> : <Copy size={18} />}
                              </div>
                              <div className="absolute inset-0 opacity-0 group-hover/copy:opacity-100 transition-opacity bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4">
                        <button
                          onClick={() => setIsInsightsDrawerOpen(!isInsightsDrawerOpen)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-yellow-600 font-serif-premium italic font-medium transition-colors hover:text-yellow-500"
                        >
                          <span>View insights</span>
                          <ChevronDown size={16} className={`transition-transform duration-300 ${isInsightsDrawerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isInsightsDrawerOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-yellow-500" />
                                <h4 className="text-sm font-bold text-black tracking-wide">SMART HIGHLIGHTS</h4>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                {result.highlights[selectedVariation].map((h, i) => (
                                  <div key={i} className="group relative">
                                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-help transition-all duration-300 border ${MOOD_CONFIG[mood || 'Inspired'].color} group-hover:scale-105 active:scale-95`}>
                                      {h.phrase}
                                    </span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 pointer-events-none z-50 transform translate-y-4 group-hover:translate-y-0">
                                      <div className={`w-72 p-5 bg-white/70 backdrop-blur-xl border-2 rounded-[1.5rem] leading-relaxed ${MOOD_CONFIG[mood || 'Inspired'].glow}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Sparkles size={12} className="text-yellow-500" />
                                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Linguistic Insight</span>
                                        </div>
                                        <p className="text-[#1D1D1F] text-[11px] font-medium leading-relaxed">{h.insight}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white/70"></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-6 mt-8">
                              <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[1.5rem] p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <Pen size={18} className="text-gray-400" />
                                  <h4 className="text-sm font-bold text-black tracking-wide">RESONANCE LOGIC</h4>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                  To achieve optimal resonance, the text underwent a series of intricate transformations. Key adjustments included: 
                                  <span className="font-semibold">{result.structuralChanges.join(', ')}</span>.
                                  These modifications were precisely calibrated to align with a <span className="font-semibold">{persona || 'Executive'}</span> cadence, 
                                  ensuring <span className="font-semibold">{mood || 'neutral'}</span> tonal synchronization for impactful reader engagement.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center text-center opacity-20 justify-center min-h-[400px]">
                      <div className="w-24 h-24 mb-6 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                        <Sparkles size={40} className="text-gray-400" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">No output generated</h4>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    {result && !status.isLoading && (
                      <div className="pt-6 border-t border-gray-100 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between px-5">
                        <div className="flex items-center">
                          <HumanScoreRing score={result.score} size={80} strokeWidth={5} />
                          <div className="ml-6 flex flex-col justify-center text-left gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 leading-none">
                              Human Likeliness
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 leading-none">
                              {result.score >= 90 ? 'Optimal Resonance' : result.score >= 80 ? 'High Frequency' : 'Active Frequency'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-start gap-3">
                          <ValidationMetric label="Meaning & Intent Preserved" state={meaningCheckState} />
                          <ValidationMetric label="100% Original & Unique" state={originalityCheckState} />
                          <div className="flex items-center gap-2 text-gray-400">
                             <Clock size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{readingTime} min read &bull; {outputWordCount} Words</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleStartOver}
                    className="px-8 py-3 bg-gray-50 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight size={14} className="rotate-180" /> New Draft
                  </button>
              </div>
            </div>
          )}
        </div>

        {currentView === 'input' && (
            <div className="flex flex-col items-center gap-12 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <button 
                  onClick={handleHumanize}
                  disabled={status.isLoading || !input.trim()}
                  className="px-12 py-6 bg-white border border-gray-100 text-[#1D1D1F] rounded-[2rem] shadow-sm flex items-center gap-4 hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 group"
                >
                   <ButtonHeartIcon className={`animate-button-heartbeat ${status.isLoading ? 'opacity-50' : ''}`} />
                   <span className="text-lg font-bold">{status.isLoading ? 'Synthesizing...' : 'Humanize'}</span>
                </button>
            </div>
        )}
      </main>

      <section id="philosophy" className="w-full bg-white py-48 px-6 mt-[60px]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-16 text-[#1D1D1F]">
            Abundance Through Connection.
          </h2>
          <div className="space-y-12 text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
            <p>
              My journey is fueled by a deep belief in the power of the universe and the infinite potential of human connection. I spend my days on LinkedIn witnessing the incredible dreams of founders and creators everywhere. I built Heartfelt to be a bridge.
            </p>
            <p>
              This is a space where your unique light shines through every word you share. We believe technology exists to amplify your natural frequency. It is about staying true to your impact while embracing the future. My mission is to help you resonate with your audience in the most authentic way possible. Together, we are making the digital world more vibrant. More real. More you.
            </p>
          </div>
          <p className="font-serif-premium italic text-[16px] text-[#444444] mt-5 mb-[10px]">
              Built for people who lead with heart.
          </p>
          <div style={{ textAlign: 'left', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif', background: 'transparent' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Sanskruti D</h1>
            <p style={{ margin: '4px 0 16px 0', fontSize: '10px', letterSpacing: '0.12em', color: '#86868b', textTransform: 'uppercase', fontWeight: 500 }}>
              FOUNDER & PRINCIPAL VISIONARY • INDIA
            </p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '15px' }}>
              <a href="https://www.linkedin.com/in/sanskrutidhamal" target="_blank" style={{ textDecoration: 'none' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="18" height="18" alt="LinkedIn" style={{ filter: 'grayscale(100%) brightness(0.2)', opacity: 0.6 }} />
              </a>
              <a href="https://www.instagram.com/cordially.sanskruti?igsh=MW5xdnRxY3F0Znc0ag==" target="_blank" style={{ textDecoration: 'none' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="18" height="18" alt="Instagram" style={{ filter: 'grayscale(100%) brightness(0.2)', opacity: 0.6 }} />
              </a>
              <button onClick={() => window.location.href = 'mailto:heartfeltai.connect@gmail.com'} style={{ background: '#1d1d1f', color: '#ffffff', border: 'none', padding: '5px 14px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                REACH OUT →
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-white py-24 px-6 border-t border-gray-50 flex flex-col items-center text-center">
        <div className="mb-12">
           <span className="text-2xl font-bold tracking-tight font-serif-premium">Heartfelt</span>
        </div>
        
        <div className="flex flex-col gap-10 mb-16">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#1D1D1F]">Sanskruti D</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Founder & Principal Visionary</p>
            <p className="text-sm font-serif italic text-emerald-600 font-medium tracking-wide">'Abundance Through Connection'</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 max-w-2xl">
            <button onClick={() => setIsPrivacyModalOpen(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors whitespace-nowrap">Privacy Policy</button>
            <button onClick={() => setIsUsageModalOpen(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors whitespace-nowrap">Usage Policy</button>
            <button onClick={() => setIsTermsModalOpen(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors whitespace-nowrap">Terms of Service</button>
            <button onClick={() => setIsTrustModalOpen(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors whitespace-nowrap">Trust & Transparency</button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
             <Mail size={12} className="text-gray-400" />
             <span className="text-[10px] font-bold text-gray-600">heartfeltai.connect@gmail.com</span>
          </div>
        </div>
      </footer>

      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsPrivacyModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <h2 className="text-4xl font-serif font-medium text-[#1D1D1F]">Heartfelt | Privacy & Data Protection</h2>
            </div>
            <div className="space-y-10 text-gray-600 leading-relaxed">
              <section className="p-6 bg-white/40 rounded-[2rem] border border-white/60">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Data Sovereignty</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  Your words belong to you. Heartfelt operates on a 'Privacy-First' architecture where inputs are processed for refinement only and are never used to train global models.
                </p>
              </section>
              <section className="p-6 bg-white/40 rounded-[2rem] border border-white/60">
                <div className="flex items-center gap-3 mb-4">
                  <Fingerprint size={20} className="text-blue-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Minimalist Collection</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  We collect only essential data (like your email: <span className="text-blue-600">heartfeltai.connect@gmail.com</span>) to manage your account and maintain the Master Engine v8.0.29.
                </p>
              </section>
              <section className="p-6 bg-white/40 rounded-[2rem] border border-white/60">
                <div className="flex items-center gap-3 mb-4">
                  <Lock size={20} className="text-blue-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Security Protocols</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  We utilize industry-standard encryption to protect your 'Voice DNA' and 'Executive' outputs.
                </p>
              </section>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Privacy Hub • Heartfelt v8.0</span>
               <button onClick={() => setIsPrivacyModalOpen(false)} className="px-8 py-3 bg-[#1D1D1F] text-white text-xs font-bold rounded-full hover:bg-black transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsUsageModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-4xl font-serif font-medium text-[#1D1D1F]">Heartfelt | Acceptable Use Policy</h2>
            </div>
            <div className="space-y-8 text-gray-600 leading-relaxed">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Intended Use</h3>
                <p className="text-lg font-medium text-gray-900 leading-relaxed italic font-serif-premium">
                  "Heartfelt is an empowerment engine for creators and professionals to bridge the gap between AI and human connection."
                </p>
              </section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Scale size={18} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Academic Integrity</h4>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    This tool is strictly NOT intended for academic dishonesty, plagiarism, or circumventing educational institutional policies.
                  </p>
                </section>
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">User Responsibility</h4>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Users are responsible for the truthfulness and legality of their final outputs.
                  </p>
                </section>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Ethical Standards • Heartfelt v8.0</span>
               <button onClick={() => setIsUsageModalOpen(false)} className="px-8 py-3 bg-[#1D1D1F] text-white text-xs font-bold rounded-full hover:bg-black transition-all">Accept & Close</button>
            </div>
          </div>
        </div>
      )}

      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsTermsModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
              <h2 className="text-4xl font-serif font-medium text-[#1D1D1F]">Heartfelt | Terms of Service</h2>
            </div>
            <div className="space-y-10 text-gray-600 leading-relaxed">
              <section className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60">
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={20} className="text-amber-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Proprietary Nature</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  Heartfelt is a proprietary language refinement platform owned by <span className="font-bold">Sanskruti Dhamal</span>. The Biological Resonance logic and Master Engine v8.0.29 are the exclusive intellectual property of the founder.
                </p>
              </section>
              <section className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60">
                <div className="flex items-center gap-3 mb-4">
                  <Scale size={20} className="text-amber-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Usage Terms</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed mb-4">
                  This service is provided 'as is'; the user is solely responsible for the intent and impact of the generated output. We reserve the right to terminate access for violations of our Ethical Usage standards.
                </p>
              </section>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">ToS Protocol • Heartfelt v8.0</span>
               <button onClick={() => setIsTermsModalOpen(false)} className="px-8 py-3 bg-[#1D1D1F] text-white text-xs font-bold rounded-full hover:bg-black transition-all">I Accept</button>
            </div>
          </div>
        </div>
      )}

      {isTrustModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/40 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsTrustModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
              <h2 className="text-4xl font-serif font-medium text-[#1D1D1F]">Heartfelt | Trust & Transparency</h2>
            </div>
            <div className="space-y-10 text-gray-600 leading-relaxed">
              <section className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60">
                <div className="flex items-center gap-3 mb-6">
                  <Heart size={20} className="text-sky-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Technology with Soul</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  We believe in technology with a soul. Our refinement algorithms are neutral and designed only to enhance human rhythm, not to inject bias.
                </p>
              </section>
              <section className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={20} className="text-sky-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Authentic Bridge</h4>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed mb-6">
                  We ensure maximum transparency regarding our 'Stealth Mode' technologies to provide users with a secure, authentic communication bridge.
                </p>
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs p-3 bg-sky-50 rounded-xl w-fit">
                  <Mail size={12} />
                  <span>For official inquiries: heartfeltai.connect@gmail.com</span>
                </div>
              </section>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Transparency Grid • Heartfelt v8.0</span>
               <button onClick={() => setIsTrustModalOpen(false)} className="px-8 py-3 bg-[#1D1D1F] text-white text-xs font-bold rounded-full hover:bg-black transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
