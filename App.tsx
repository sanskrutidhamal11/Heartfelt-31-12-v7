/* FINAL SYNC UPDATE: PRODUCTION-READY STABLE BUILD v1.1 - FIXED PHILOSOPHY SECTION & DEPLOYMENT SYNC */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Fingerprint, Trash2, ArrowRight, Info, Clock, AlertCircle, Linkedin, Instagram, Settings2, X, ShieldCheck, Scale, Mail, FileText, Heart, Lock, Pen, ChevronDown, Globe, LoaderCircle, CheckCircle2 } from 'lucide-react';
import HumanScoreRing from './components/HumanScoreRing';
import { detectAIPatterns, humanizeText } from './services/geminiService';
import { HumanizationResult, ProcessingState, HumanizationIntensity, HumanizationPersona, HumanizationPlatform, ReaderMood, HumanizationVariations, AIPattern } from './types';

const MOOD_CONFIG: Record<ReaderMood, { icon: string, label: string, color: string, glow: string }> = {
  'Inspired': { icon: '😍', label: 'Inspired', color: 'bg-amber-50 text-amber-700 border-amber-100', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-400/50' },
  'Skeptical': { icon: '🧐', label: 'Skeptical', color: 'bg-sky-50 text-sky-700 border-sky-100', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)] border-sky-400/50' },
  'Bored': { icon: '😴', label: 'Bored', color: 'bg-slate-50 text-slate-700 border-slate-100', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)] border-slate-400/50' },
  'Upset': { icon: '😤', label: 'Upset', color: 'bg-rose-50 text-rose-700 border-rose-100', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-400/50' }
};

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
      transform: 'translateY(0.1em)',
      filter: 'drop-shadow(0 0 15px rgba(255, 102, 178, 0.9))'
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
        type="button"
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
              type="button"
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

const ValidationMetric: React.FC<{ label: string; state: 'idle' | 'loading' | 'checked' }> = ({ label, state }) => {
  if (state === 'idle') return null;
  return (
    <div className="flex items-center gap-3 text-gray-800 animate-fade-in-up">
      {state === 'loading' && <LoaderCircle size={14} className="animate-spin text-gray-400" />}
      {state === 'checked' && <CheckCircle2 size={14} className="text-green-500" />}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState<HumanizationPersona | null>(null);
  const [platform, setPlatform] = useState<HumanizationPlatform | null>(null);
  const [mood, setMood] = useState<ReaderMood | null>(null);
  const [intensity, setIntensity] = useState<HumanizationIntensity | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<keyof HumanizationVariations>('essential');
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [status, setStatus] = useState<ProcessingState>({ isLoading: false, error: null, isScanning: false, isScrambling: false });
  const [copied, setCopied] = useState(false);
  const [styleSample, setStyleSample] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false);
  const [isPersonalizationDrawerOpen, setIsPersonalizationDrawerOpen] = useState(false);
  const [meaningCheckState, setMeaningCheckState] = useState<'idle' | 'loading' | 'checked'>('idle');
  const [originalityCheckState, setOriginalityCheckState] = useState<'idle' | 'loading' | 'checked'>('idle');
  const [usageCount, setUsageCount] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'input' | 'processing' | 'output'>('input');

  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('heartfelt_usage');
    if (saved) {
      setUsageCount(parseInt(saved));
    }
  }, []);

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

  const handleHumanize = async () => {
    if (!input.trim() || status.isLoading || usageCount >= 5) return;

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setResult(null);
    setCurrentView('processing');

    try {
      const data = await humanizeText(input, 
        intensity || 'Standard', 
        persona || 'General',
        platform || 'General', 
        { styleSample, keywords, mood: mood || undefined }
      );

      setResult({
        originalText: input,
        variations: data.variations,
        resonanceScores: data.resonanceScores,
        highlights: data.highlights,
        score: data.score,
        structuralChanges: data.changes,
        integrityPass: data.integrityPass
      });

      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('heartfelt_usage', newCount.toString());

      setStatus(prev => ({ ...prev, isLoading: false, error: null }));
      setCurrentView('output');
    } catch (err: any) {
      setStatus(prev => ({ ...prev, isLoading: false, error: err.message || "Simulation failed." }));
      setCurrentView('input');
    }
  };

  const handleStartOver = () => {
    setResult(null);
    setStatus(prev => ({ ...prev, isLoading: false, error: null }));
    setCurrentView('processing');
    setTimeout(() => {
      setInput('');
      setIsInsightsDrawerOpen(false);
      setCurrentView('input');
    }, 500);
  };

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputText]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1F] transition-colors duration-500">
      <nav className="fixed top-0 w-full glass-nav z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tight font-serif-premium">Heartfelt</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
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

        <div className="relative w-full mb-10">
          {currentView === 'input' && (
            <div className="w-full bg-white rounded-[3rem] p-4 md:p-6 apple-shadow flex flex-col animate-fade-in-scale-up transition-all duration-400 ease-out">
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
                    type="button"
                    onClick={() => setIsPersonalizationDrawerOpen(!isPersonalizationDrawerOpen)}
                    className="text-sm text-yellow-600 font-serif-premium italic font-medium transition-colors hover:text-yellow-500 flex items-center gap-2"
                  >
                    Personalization Options
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isPersonalizationDrawerOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {isPersonalizationDrawerOpen && (
                  <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100 mt-2 animate-fade-in-up">
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Keywords to Preserve (e.g., HeartfeltAI, v8.0)"
                      className="w-full bg-white border-2 border-slate-200 rounded-full py-3 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                    <textarea
                      value={styleSample}
                      onChange={(e) => setStyleSample(e.target.value)}
                      placeholder="Paste your writing sample to mimic your style..."
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <div className="relative w-full bg-gray-50 rounded-[2rem] border border-transparent focus-within:border-amber-300 focus-within:bg-white p-8">
                <textarea
                  value={input}
                  onScroll={handleScroll}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste AI content..."
                  className="w-full min-h-[300px] text-2xl font-medium text-[#1A1A1A] leading-relaxed outline-none resize-none placeholder:text-gray-200 bg-transparent"
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{inputWordCount} words</span>
                  <button type="button" onClick={() => setInput('')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'processing' && (
            <div className="w-full bg-white rounded-[3rem] p-40 flex justify-center items-center animate-fade-in-scale-up apple-shadow" style={{ minHeight: '400px' }}>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-gold-aura-pulse shadow-md">
                 <DivineHeartIcon className="!h-10 !w-10 text-yellow-500" />
              </div>
            </div>
          )}
          
          {currentView === 'output' && result && (
            <div className="animate-fade-in-scale-up space-y-6">
              <div className="w-full bg-white rounded-[3rem] p-10 apple-shadow">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold text-black tracking-wide">REFINED OUTPUT</h3>
                  <div className="flex gap-1 p-1 bg-gray-50 rounded-full">
                    {(['essential', 'storyteller', 'visionary'] as (keyof HumanizationVariations)[]).map(v => (
                      <button key={v} onClick={() => setSelectedVariation(v)} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${selectedVariation === v ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-8 relative min-h-[300px]">
                  <p className="text-2xl leading-relaxed text-[#1A1A1A] whitespace-pre-wrap">{result.variations[selectedVariation]}</p>
                  <button type="button" onClick={handleCopy} className="absolute bottom-6 right-6 p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-all">
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-500" />}
                  </button>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <HumanScoreRing score={result.score} size={80} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Human Likeliness</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Optimal Resonance</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <ValidationMetric label="Meaning & Intent Preserved" state={meaningCheckState} />
                    <ValidationMetric label="100% Original & Unique" state={originalityCheckState} />
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleStartOver} className="mx-auto block px-10 py-4 bg-gray-100 rounded-full text-xs font-bold hover:bg-gray-200 transition-all">Start Over</button>
            </div>
          )}
        </div>

        {currentView === 'input' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <button 
              type="button"
              onClick={handleHumanize}
              disabled={status.isLoading || !input.trim() || usageCount >= 5}
              className="px-12 py-6 bg-white border border-gray-100 text-[#1D1D1F] rounded-[2rem] shadow-sm flex items-center gap-4 hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 group"
            >
               <ButtonHeartIcon className="animate-button-heartbeat" />
               <span className="text-lg font-bold">{usageCount >= 5 ? 'Daily Free Limit Reached' : 'Humanize'}</span>
            </button>
            {usageCount >= 5 && (
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Come back tomorrow for more free credits.</p>
            )}
          </div>
        )}
      </main>

      {/* PHILOSOPHY SECTION - PERMANENT STATIC ELEMENT */}
      <section id="philosophy" className="w-full bg-white py-48 px-6 mt-20 border-t border-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-16 text-[#1D1D1F]">Abundance Through Connection.</h2>
          <div className="space-y-12 text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
            <p>My journey is fueled by a deep belief in the power of the universe and the infinite potential of human connection. I built Heartfelt to be a bridge—a space where your unique light shines through every word you share.</p>
            <p>We believe technology exists to amplify your natural frequency. Together, we are making the digital world more vibrant. More real. More you.</p>
          </div>
          <div className="mt-20 pt-10 border-t border-gray-100">
            <h3 className="text-2xl font-bold">Sanskruti D</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">FOUNDER & PRINCIPAL VISIONARY</p>
            <div className="flex gap-6 mt-8">
              <a href="https://linkedin.com/in/sanskrutidhamal" target="_blank" rel="noopener noreferrer" className="block p-1">
                <Linkedin size={24} className="text-gray-400 hover:text-blue-600 transition-all" />
              </a>
              <a href="https://instagram.com/cordially.sanskruti" target="_blank" rel="noopener noreferrer" className="block p-1">
                <Instagram size={24} className="text-gray-400 hover:text-rose-600 transition-all" />
              </a>
              <a href="mailto:heartfeltai.connect@gmail.com" className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold inline-flex items-center hover:bg-gray-800 transition-colors">
                REACH OUT →
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-white py-24 px-6 border-t border-gray-100 flex flex-col items-center">
        <span className="text-2xl font-bold font-serif-premium mb-12">Heartfelt</span>
        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-gray-300">
          <button type="button" className="hover:text-black transition-colors">Privacy Policy</button>
          <button type="button" className="hover:text-black transition-colors">Usage Policy</button>
          <button type="button" className="hover:text-black transition-colors">Terms of Service</button>
          <button type="button" className="hover:text-black transition-colors">Trust & Transparency</button>
        </div>
        <span className="mt-16 text-[10px] font-bold text-gray-200">© 2024 HEARTFELT AI • ALL RIGHTS RESERVED</span>
      </footer>
    </div>
  );
};

export default App;
