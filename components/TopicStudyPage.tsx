
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Unit, Topic, LearningCategory, TopicStudyContent, Message, TopicStatus } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import PracticeModal from './PracticeModal';
import CelebrationOverlay from './CelebrationOverlay';
import ChatPanel from './ChatPanel';
import { TopicContentSkeleton } from './LoadingState';

// Helper to clean markdown for Text-to-Speech
const cleanMarkdownForTTS = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[*#`_]/g, '') // Remove Markdown syntax
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/<[^>]*>/g, '') // Remove HTML
    .replace(/\n+/g, '. '); // Replace newlines with pauses
};

const ReflectivePause = ({ prompt }: { prompt: string }) => (
  <div className="my-12 p-8 bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r-xl italic text-slate-600 dark:text-slate-300 font-serif text-lg leading-relaxed">
    <span className="font-bold text-indigo-600 dark:text-indigo-400 not-italic block mb-2 text-xs uppercase tracking-widest">Reflect</span>
    {prompt}
  </div>
);

interface TopicStudyPageProps {
  subject: Subject;
  unit: Unit;
  topic: Topic;
  semester: string;
  category: LearningCategory;
  content?: TopicStudyContent;
  onBack: () => void;
  onStartQuiz: () => void;
  isLoading: boolean;
  onSaveNotes: (notes: string) => void;
  initialNotes: string;
  onRefreshContent: (action: string) => void;
  messages: Message[];
  onSendMessage: (text: string, mode: 'CONCEPT' | 'EXAM') => void;
  isChatLoading: boolean;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onToggleRevision?: (topicId: string) => void; // New prop
  nextTopic?: Topic;
  onNextTopic: () => void;
}

const TopicStudyPage: React.FC<TopicStudyPageProps> = ({
  subject,
  unit,
  topic,
  semester,
  category,
  content,
  onBack,
  onStartQuiz,
  isLoading,
  onSaveNotes,
  initialNotes,
  onRefreshContent,
  messages,
  onSendMessage,
  isChatLoading,
  onUpdateStatus,
  onToggleRevision,
  nextTopic,
  onNextTopic
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(Date.now());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [studyMode, setStudyMode] = useState<'CONCEPT' | 'EXAM'>('CONCEPT');
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  // Gamification & Focus States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFocusAiOpen, setIsFocusAiOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [revisionSections, setRevisionSections] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [showMasteryCelebration, setShowMasteryCelebration] = useState(false);
  
  // --- READ ALOUD STATE ---
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const isUpskill = category === LearningCategory.UPSKILL;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        synthRef.current = window.speechSynthesis;
    }
    return () => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
    };
  }, []);

  // Sync initial notes if they change externally (e.g. fresh load)
  useEffect(() => {
    if (initialNotes && initialNotes !== notes) {
        setNotes(initialNotes);
    }
  }, [initialNotes]);

  const sectionsList = [
    { id: 'overview', label: 'Overview' },
    { id: 'concepts', label: 'Key Concepts' },
    { id: 'exam', label: isUpskill ? 'Interview Focus' : 'Exam Focus' },
    { id: 'examples', label: 'Examples' },
    { id: 'revision', label: 'Quick Revision' }
  ];

  const handleReadAloud = () => {
    if (!content || !synthRef.current) return;

    if (isReading) {
        stopReadAloud();
        return;
    }

    setIsReading(true);
    setIsPaused(false);
    
    const playlist = sectionsList.map(sec => ({
        id: sec.id,
        title: sec.label,
        text: `${sec.label}. ${cleanMarkdownForTTS((content as any)[sec.id === 'concepts' ? 'keyConcepts' : sec.id === 'exam' ? 'examFocus' : sec.id === 'revision' ? 'quickRevision' : sec.id])}`
    }));

    let startIndex = playlist.findIndex(p => p.id === activeSectionId);
    if (startIndex === -1) startIndex = 0;

    playSection(playlist, startIndex);
  };

  const playSection = (playlist: any[], index: number) => {
    if (index >= playlist.length || !synthRef.current) {
        stopReadAloud();
        return;
    }

    const item = playlist[index];
    setActiveSectionId(item.id);
    scrollToSection(item.id);

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = readingSpeed;
    utterance.pitch = 1.0;
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
        playSection(playlist, index + 1);
    };

    utterance.onerror = (e) => {
        console.error("TTS Error", e);
        stopReadAloud();
    };

    utteranceRef.current = utterance;
    synthRef.current.cancel(); 
    synthRef.current.speak(utterance);
  };

  const stopReadAloud = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsReading(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  const togglePauseResume = () => {
    if (!synthRef.current) return;
    if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
    } else {
        synthRef.current.pause();
        setIsPaused(true);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(readingSpeed) + 1) % speeds.length;
    setReadingSpeed(speeds[nextIdx]);
  };

  // --- FOCUS MODE HANDLERS ---
  const toggleFocusMode = async () => {
    if (!isFocusMode) {
      setIsFocusMode(true);
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request denied:", err);
      }
    } else {
      setIsFocusMode(false);
      setIsFocusAiOpen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.warn("Exit fullscreen error:", err);
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        setIsFocusAiOpen(false);
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
      }
    };
    
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            setIsFocusMode(false);
            setIsFocusAiOpen(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFocusMode]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNotes(newText);
    setIsSaving(true);

    // Debounce Save
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
        onSaveNotes(newText);
        setIsSaving(false);
        setLastSaved(Date.now());
    }, 1000);
  };

  const handleBlurNotes = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    onSaveNotes(notes);
    setIsSaving(false);
    setLastSaved(Date.now());
  };

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      if (!isReading) {
        const sections = ['overview', 'concepts', 'exam', 'examples', 'revision'];
        for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top >= 0 && rect.top < clientHeight / 2) {
                    setActiveSectionId(id);
                    break;
                }
            }
        }
      }
    }
  };

  const toggleSectionState = (sectionKey: string, state: 'READ' | 'REVISION') => {
    if (state === 'READ') {
        const newRead = new Set(readSections);
        const newRevision = new Set(revisionSections);
        
        if (newRead.has(sectionKey)) {
            newRead.delete(sectionKey);
        } else {
            newRead.add(sectionKey);
            newRevision.delete(sectionKey);
            if (newRead.size >= 5 && topic.status !== 'Completed') {
                setShowMasteryCelebration(true);
                onUpdateStatus(topic.id, 'Completed');
            }
        }
        setReadSections(newRead);
        setRevisionSections(newRevision);
    } else {
        const newRevision = new Set(revisionSections);
        const newRead = new Set(readSections);

        if (newRevision.has(sectionKey)) {
            newRevision.delete(sectionKey);
        } else {
            newRevision.add(sectionKey);
            newRead.delete(sectionKey); 
        }
        setRevisionSections(newRevision);
        setReadSections(newRead);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveSectionId(id);
    }
  };

  const handleQuickAction = (action: string, prompt?: string) => {
    if (prompt) {
      setIsAiOpen(true);
      onSendMessage(prompt, studyMode);
    } else {
      onRefreshContent(action);
    }
  };

  const ContentSection = ({ 
    title, 
    content, 
    id,
    importance
  }: { 
    title: string, 
    content: string, 
    id: string,
    importance?: string
  }) => {
    const isRead = readSections.has(id);
    const isRevision = revisionSections.has(id);
    const isActive = activeSectionId === id;
    const isCurrentlyReading = isReading && isActive;
    
    return (
        <section id={id} className={`group relative mb-24 transition-opacity duration-500 ${isRead && !isCurrentlyReading ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>
            
            {/* Margins Indicators */}
            <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isActive && <div className="absolute -left-6 top-0 h-12 w-[2px] bg-indigo-500 dark:bg-indigo-400 transition-all"></div>}
            {isCurrentlyReading && <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-indigo-500 dark:bg-indigo-400 animate-pulse"></div>}

            {/* Header */}
            <div className="mb-8">
                {importance && (
                    <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        {importance}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <h2 className={`font-serif text-3xl md:text-4xl font-medium tracking-tight text-slate-900 dark:text-slate-100 transition-colors ${isCurrentlyReading ? 'text-indigo-600 dark:text-indigo-300' : ''}`}>
                        {title}
                    </h2>
                    {/* Status Icons */}
                    <div className="flex gap-2">
                        {isRead && <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>}
                        {isRevision && <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01" /></svg></div>}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="prose prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none font-sans leading-loose text-slate-600 dark:text-slate-300">
                <MarkdownRenderer content={content} className="text-lg md:text-xl leading-loose font-normal" />
            </div>

            {/* Inline Actions (Visible on Hover/Focus) */}
            <div className="mt-8 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-t border-slate-100 dark:border-white/5 pt-6">
                <button 
                    onClick={() => toggleSectionState(id, 'READ')}
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${isRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    {isRead ? 'Marked as Read' : 'Mark as Read'}
                </button>
                <button 
                    onClick={() => toggleSectionState(id, 'REVISION')}
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${isRevision ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400'}`}
                >
                    {isRevision ? 'Marked for Review' : 'Flag for Review'}
                </button>
            </div>

            {/* Separator Line */}
            <div className="mt-16 border-b border-slate-200 dark:border-white/5 w-full"></div>
        </section>
    );
  };

  const isMarkedForRevision = topic.status === 'Needs Revision' || topic.isHistoricalWeakness;

  return (
    <div className={`h-full flex flex-col overflow-hidden relative transition-colors duration-700 ${isFocusMode ? 'fixed inset-0 z-[200] bg-[#fafafa] dark:bg-[#030303]' : 'bg-[#FAFAFA] dark:bg-graphite-base'}`}>
      
      {showMasteryCelebration && <CelebrationOverlay type="TOPIC_COMPLETE" onComplete={() => setShowMasteryCelebration(false)} />}

      <PracticeModal 
        isOpen={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
        subject={subject}
        topic={topic}
        category={category}
      />

      {/* READING PROGRESS BAR */}
      <div className={`h-1 w-full fixed top-0 left-0 right-0 z-[210] bg-transparent`}>
         <div 
            className={`h-full transition-all duration-300 ease-out ${isFocusMode ? 'bg-slate-400/30 dark:bg-white/20' : 'bg-indigo-600 dark:bg-indigo-500'}`} 
            style={{ width: `${scrollProgress}%` }}
         ></div>
      </div>

      {/* HEADER (Conditional) */}
      {!isFocusMode && (
        <div className="border-b border-slate-200 dark:border-graphite-border px-6 md:px-12 py-4 flex justify-between items-center bg-white/80 dark:bg-graphite-surface/80 backdrop-blur-xl sticky top-0 z-20 transition-all">
            <div className="flex items-center gap-6">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-800 dark:text-graphite-text-muted dark:hover:text-graphite-text-main transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">
                        <span>{subject.code}</span>
                        <span className="text-slate-300 dark:text-graphite-text-disabled">/</span>
                        <span>Module {unit.number}</span>
                    </div>
                    <h1 className="text-lg font-bold font-sans text-slate-900 dark:text-graphite-text-main">{topic.name}</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {/* REVISION TOGGLE (HEADER) */}
                {onToggleRevision && (
                    <button 
                        onClick={() => onToggleRevision(topic.id)}
                        className={`p-2 rounded-full transition-colors border ${isMarkedForRevision ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-900/20 dark:border-rose-900/30' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:bg-transparent dark:border-graphite-border dark:text-graphite-text-muted dark:hover:text-rose-400'}`}
                        title={isMarkedForRevision ? "Remove from Revision" : "Mark for Revision"}
                    >
                        <svg className="w-5 h-5" fill={isMarkedForRevision ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                )}

                <button onClick={handleReadAloud} className={`p-2 rounded-full transition-colors ${isReading ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub'}`} title="Read Aloud">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </button>
                <button onClick={toggleFocusMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub transition-colors" title="Focus Mode">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>
                <button onClick={() => setIsAiOpen(!isAiOpen)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isAiOpen ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-transparent dark:text-graphite-text-main dark:border-graphite-border'}`}>
                    {isAiOpen ? 'Close AI' : 'AI Assistant'}
                </button>
            </div>
        </div>
      )}

      {/* Focus Mode Controls */}
      {isFocusMode && (
        <div className="fixed top-8 right-8 z-[220] flex flex-col gap-3 items-end">
            <button onClick={toggleFocusMode} className="bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all text-slate-500 dark:text-slate-300" title="Exit Focus">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button 
                onClick={handleReadAloud} 
                className={`bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all ${isReading ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-300'}`} 
                title={isReading ? "Stop Reading" : "Read Aloud"}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </button>
            <button onClick={() => setIsFocusAiOpen(!isFocusAiOpen)} className={`bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all ${isFocusAiOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-300'}`} title="AI Assistant">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
        </div>
      )}

      {/* Focus Mode AI Sidebar */}
      {isFocusMode && (
        <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#fafafa] dark:bg-[#030303] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[215] transform transition-transform duration-300 ease-in-out flex flex-col ${isFocusAiOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="font-serif font-bold text-slate-700 dark:text-slate-200">Focus Assistant</h3>
                <button onClick={() => setIsFocusAiOpen(false)}><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-hidden">
                 <ChatPanel messages={messages} onSendMessage={(text) => onSendMessage(text, studyMode)} isLoading={isChatLoading} category={category} />
            </div>
        </div>
      )}

      {/* Floating Audio Player */}
      {isReading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[220] flex items-center gap-4 bg-white/90 dark:bg-graphite-surface/90 backdrop-blur-xl border border-slate-200 dark:border-graphite-border p-3 px-6 rounded-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-graphite-border">
                <div className="flex space-x-0.5 items-end h-3">
                    <div className={`w-1 bg-indigo-600 dark:bg-indigo-400 rounded-sm ${isPaused ? 'h-1' : 'h-3 animate-[bounce_1s_infinite]'}`}></div>
                    <div className={`w-1 bg-indigo-600 dark:bg-indigo-400 rounded-sm ${isPaused ? 'h-1' : 'h-2 animate-[bounce_1.2s_infinite]'}`}></div>
                    <div className={`w-1 bg-indigo-600 dark:bg-indigo-400 rounded-sm ${isPaused ? 'h-1' : 'h-3 animate-[bounce_0.8s_infinite]'}`}></div>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-graphite-text-main max-w-[100px] truncate">{sectionsList.find(s => s.id === activeSectionId)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={stopReadAloud} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg></button>
                <button onClick={togglePauseResume} className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center hover:scale-105 transition-all">
                    {isPaused ? <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>}
                </button>
                <button onClick={changeSpeed} className="ml-2 text-[10px] font-black text-slate-500 dark:text-slate-400 w-6">{readingSpeed}x</button>
            </div>
        </div>
      )}

      {/* MAIN SCROLL AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        <div ref={contentRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth transition-all duration-500 ${isAiOpen && !isFocusMode ? 'w-full md:w-auto border-r border-slate-200 dark:border-graphite-border' : 'w-full'}`}>
          
          <div className={`mx-auto transition-all duration-700 ease-in-out ${isFocusMode ? 'max-w-4xl py-24 px-8 md:px-16' : 'max-w-7xl p-6 md:p-12 pb-48 grid grid-cols-1 lg:grid-cols-12 gap-12'}`}>
             
             {/* Main Content Column */}
             <div className={`${isFocusMode ? 'w-full' : 'lg:col-span-9'}`}>
                
                <div className="mb-8 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">{subject.code} — Module {unit.number}</p>
                    <h1 className={`${isFocusMode ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'} font-serif font-medium text-slate-900 dark:text-slate-100 tracking-tight leading-tight`}>{topic.name}</h1>
                    <div className="w-16 h-1 bg-slate-200 dark:bg-white/10 mx-auto mt-6 rounded-full"></div>
                </div>

                {(isLoading || !content) ? (
                    <TopicContentSkeleton />
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <ContentSection id="overview" title="Overview" content={content.overview} importance="Core Concept" />
                        
                        <ReflectivePause prompt={`Pause: Explain "${topic.name}" in your own words before continuing.`} />

                        <ContentSection id="concepts" title="Key Concepts" content={content.keyConcepts} />

                        <ReflectivePause prompt="Connect: How does this concept apply to real-world scenarios?" />

                        <ContentSection id="exam" title={isUpskill ? "Interview Focus" : "Exam Focus"} content={content.examFocus} importance={isUpskill ? "High Impact" : "Exam Priority"} />

                        <ContentSection id="examples" title="Examples & Applications" content={content.examples} />

                        <ContentSection id="revision" title="Quick Revision" content={content.quickRevision} importance="Summary" />

                        {/* Completion Footer */}
                        <div className="mt-32 pb-20 text-center border-t border-slate-200 dark:border-white/5 pt-20">
                            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">You've reached the end.</h3>
                            <div className="flex flex-col md:flex-row justify-center gap-4">
                                {nextTopic && (
                                    <button onClick={onNextTopic} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                                        Next Topic &rarr;
                                    </button>
                                )}
                                <button onClick={onStartQuiz} className="px-8 py-4 bg-transparent border-2 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white rounded-full font-bold text-sm uppercase tracking-widest hover:border-slate-900 dark:hover:border-white transition-colors">
                                    Take Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </div>

             {/* Right Sidebar (Navigation) - Hidden in Focus Mode */}
             {!isFocusMode && (
                <div className={`lg:col-span-3 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4 space-y-8 ${isAiOpen ? 'hidden' : ''}`}>
                    {/* Navigator */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 pl-2">Contents</h3>
                        <div className="space-y-1 relative border-l border-slate-200 dark:border-graphite-border ml-2">
                            {sectionsList.map((sec) => (
                                <button 
                                    key={sec.id}
                                    onClick={() => scrollToSection(sec.id)}
                                    className={`w-full text-left pl-4 py-2 text-xs font-bold transition-all border-l-2 -ml-[1px]
                                        ${activeSectionId === sec.id ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-graphite-text-sub dark:hover:text-slate-300'}
                                    `}
                                >
                                    {sec.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 pl-2">Tools</h3>
                        <div className="flex flex-col gap-2">
                            {[{ label: "Explain Simply", action: "simplify", prompt: "Explain simply." }, { label: "Code Example", action: "code", prompt: "Show code." }, { label: "Practice Mode", isModalTrigger: true }].map((action, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => action.isModalTrigger ? setShowPracticeModal(true) : handleQuickAction(action.action!, action.prompt)}
                                    className="text-left px-4 py-3 rounded-xl bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border text-xs font-bold text-slate-600 dark:text-graphite-text-sub hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Scratchpad */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted pl-1">
                                Scratchpad
                            </h3>
                            <span className={`text-[9px] font-medium transition-opacity duration-300 ${isSaving ? 'opacity-100 text-indigo-500 dark:text-indigo-400' : 'opacity-0'}`}>
                                Saving...
                            </span>
                        </div>
                        
                        <div className="group relative">
                            {/* Focus Glow Effect */}
                            <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                            
                            <textarea 
                                value={notes}
                                onChange={handleNoteChange}
                                onBlur={handleBlurNotes}
                                placeholder="Write your thoughts, notes, or doubts here..."
                                className="relative w-full min-h-[350px] p-5 rounded-2xl bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border text-sm leading-7 text-slate-700 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all resize-y shadow-sm font-sans"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>

        {/* Chat Panel (Right Side) */}
        {isAiOpen && !isFocusMode && (
           <div className="w-[400px] border-l border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface shadow-2xl z-30 animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-graphite-border flex justify-between items-center bg-slate-50 dark:bg-graphite-base">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted">AI Tutor</span>
                 <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatPanel messages={messages} onSendMessage={(text) => onSendMessage(text, studyMode)} isLoading={isChatLoading} category={category} />
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default TopicStudyPage;
