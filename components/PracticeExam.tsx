
import React, { useState, useEffect, useRef } from 'react';
import { ExamConfig, ExamSession, DSAProblem, ExamQuestionResult } from '../types';
import { DSA_CURRICULUM } from '../constants';
import JavaCompiler from './JavaCompiler';

interface PracticeExamProps {
  onClose: () => void;
  onUpdateProgress?: (results: ExamQuestionResult[]) => void;
}

const PracticeExam: React.FC<PracticeExamProps> = ({ onClose, onUpdateProgress }) => {
  const [step, setStep] = useState<'CONFIG' | 'EXAM' | 'RESULTS'>('CONFIG');
  
  // Configuration State
  const [config, setConfig] = useState<ExamConfig>({
    topics: [],
    difficulty: 'Medium',
    questionCount: 3,
    mode: 'UNTIMED'
  });

  // Session State
  const [session, setSession] = useState<ExamSession | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Derived: Available Topics
  const allTopics = Array.from(new Set(DSA_CURRICULUM.flatMap(section => section.problems.flatMap(p => p.topics)))).sort();

  // --- ACTIONS ---

  const handleConfigChange = (key: keyof ExamConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleTopic = (topic: string) => {
    setConfig(prev => {
      const exists = prev.topics.includes(topic);
      if (exists) return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      return { ...prev, topics: [...prev.topics, topic] };
    });
  };

  const startExam = () => {
    // 1. Filter Questions
    let pool = DSA_CURRICULUM.flatMap(s => s.problems);
    
    // Filter by Difficulty (unless Mixed)
    if (config.difficulty !== 'Mixed') {
      pool = pool.filter(p => p.difficulty === config.difficulty);
    }

    // Filter by Topics (if any selected)
    if (config.topics.length > 0) {
      pool = pool.filter(p => p.topics.some(t => config.topics.includes(t)));
    }

    // 2. Shuffle
    pool = pool.sort(() => 0.5 - Math.random());

    // 3. Slice
    const questions = pool.slice(0, config.questionCount);

    if (questions.length === 0) {
      alert("No questions match your criteria. Please broaden your selection.");
      return;
    }

    // 4. Setup Session
    const timeLimit = config.mode === 'TIMED' ? config.questionCount * 15 * 60 : null; // 15 min per question default

    setSession({
      questions,
      currentIndex: 0,
      results: [],
      startTime: Date.now(),
      totalTimeLimit: timeLimit
    });

    if (timeLimit) {
      setTimeLeft(timeLimit);
    }

    setStep('EXAM');
  };

  // Timer Logic
  useEffect(() => {
    if (step === 'EXAM' && session?.totalTimeLimit) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleExamFinish(); // Auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleExamFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('RESULTS');
    if (onUpdateProgress && session) {
        onUpdateProgress(session.results);
    }
  };

  const handleQuestionComplete = (status: 'Correct' | 'Skipped') => {
    if (!session) return;

    // Record Result
    const currentQ = session.questions[session.currentIndex];
    const timeSpent = 0; // Simplified tracking for now, can improve with per-q timer

    const newResult: ExamQuestionResult = {
      problemId: currentQ.id,
      status,
      timeSpent
    };

    const updatedResults = [...session.results, newResult];

    // Next Question or Finish
    if (session.currentIndex < session.questions.length - 1) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
        results: updatedResults
      });
    } else {
      setSession({ ...session, results: updatedResults });
      handleExamFinish();
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- RENDERERS ---

  if (step === 'CONFIG') {
    return (
      <div className="p-8 max-w-4xl mx-auto h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-start mb-8">
           <button onClick={onClose} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-graphite-text-muted dark:hover:text-graphite-text-main transition-colors mb-4">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
             Exit Exam
           </button>
           <div>
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-graphite-text-sub mb-2 block">Practice Mode</span>
             <h1 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main">Configure Exam</h1>
             <p className="text-slate-500 dark:text-graphite-text-sub mt-2">Customize your practice session to simulate real interview conditions.</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
           {/* LEFT COL: Settings */}
           <div className="space-y-8">
              {/* Difficulty */}
              <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 block">Difficulty Level</label>
                 <div className="grid grid-cols-4 gap-2">
                    {['Easy', 'Medium', 'Hard', 'Mixed'].map(diff => (
                       <button
                         key={diff}
                         onClick={() => handleConfigChange('difficulty', diff)}
                         className={`py-3 rounded-xl text-xs font-bold transition-all border
                           ${config.difficulty === diff 
                             ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-graphite-action dark:text-graphite-base' 
                             : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 dark:bg-graphite-base dark:text-graphite-text-sub dark:border-graphite-border'}
                         `}
                       >
                         {diff}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Count & Mode */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 block">Questions</label>
                    <div className="flex gap-2">
                       {[1, 3, 5, 10].map(count => (
                          <button
                            key={count}
                            onClick={() => handleConfigChange('questionCount', count)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border
                              ${config.questionCount === count
                                ? 'bg-slate-800 text-white border-slate-800 dark:bg-graphite-text-main dark:text-graphite-base'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 dark:bg-graphite-base dark:text-graphite-text-sub dark:border-graphite-border'}
                            `}
                          >
                            {count}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 block">Mode</label>
                    <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-xl">
                       <button
                         onClick={() => handleConfigChange('mode', 'UNTIMED')}
                         className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${config.mode === 'UNTIMED' ? 'bg-white dark:bg-graphite-surface shadow-sm text-indigo-600 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                       >Practice</button>
                       <button
                         onClick={() => handleConfigChange('mode', 'TIMED')}
                         className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${config.mode === 'TIMED' ? 'bg-white dark:bg-graphite-surface shadow-sm text-rose-600 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                       >Timed</button>
                    </div>
                 </div>
              </div>
           </div>

           {/* RIGHT COL: Topics */}
           <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">Target Topics</label>
                 <button onClick={() => setConfig({...config, topics: []})} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Clear All</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="flex flex-wrap gap-2">
                    {allTopics.map(topic => (
                       <button
                         key={topic}
                         onClick={() => toggleTopic(topic)}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all
                           ${config.topics.includes(topic)
                             ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-300'
                             : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 dark:bg-graphite-base dark:border-graphite-border dark:text-graphite-text-sub'}
                         `}
                       >
                         {topic}
                       </button>
                    ))}
                 </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted mt-4 text-center">
                 {config.topics.length === 0 ? "Select topics or leave empty for all." : `${config.topics.length} topics selected.`}
              </p>
           </div>
        </div>

        <div className="pt-8 mt-4 border-t border-slate-100 dark:border-graphite-border flex justify-end">
           <button 
             onClick={startExam}
             className="px-10 py-4 bg-slate-900 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
           >
             Start Exam
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </button>
        </div>
      </div>
    );
  }

  if (step === 'EXAM' && session) {
    const currentQ = session.questions[session.currentIndex];
    
    // Header Content Injection for JavaCompiler
    const headerContent = (
       <div className="flex items-center gap-6 bg-slate-50 dark:bg-graphite-base px-4 py-1.5 rounded-xl border border-slate-200 dark:border-graphite-border">
          <div className="flex flex-col items-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">Question</span>
             <span className="text-sm font-black text-slate-800 dark:text-graphite-text-main">{session.currentIndex + 1} <span className="text-slate-400 font-normal">/ {session.questions.length}</span></span>
          </div>
          
          {config.mode === 'TIMED' && (
             <div className="w-px h-6 bg-slate-200 dark:bg-graphite-border"></div>
          )}

          {config.mode === 'TIMED' && (
             <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">Time Left</span>
                <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-800 dark:text-graphite-text-main'}`}>
                   {formatTime(timeLeft)}
                </span>
             </div>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-graphite-border"></div>

          <button 
             onClick={() => handleQuestionComplete('Skipped')}
             className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 dark:text-graphite-text-sub dark:hover:text-rose-400 transition-colors"
          >
             Skip
          </button>
       </div>
    );

    return (
       <JavaCompiler 
          key={currentQ.id} // Forces remount on new question
          problem={currentQ}
          onBack={() => {
             if (confirm("Quit exam? Progress will be lost.")) {
                onClose();
             }
          }}
          onSolve={() => handleQuestionComplete('Correct')}
          headerContent={headerContent}
       />
    );
  }

  if (step === 'RESULTS' && session) {
     const correctCount = session.results.filter(r => r.status === 'Correct').length;
     const percentage = Math.round((correctCount / session.questions.length) * 100);
     
     return (
        <div className="p-8 max-w-4xl mx-auto h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="text-center mb-10">
              <div className="inline-block p-4 rounded-full bg-slate-50 dark:bg-graphite-secondary mb-6 border border-slate-100 dark:border-graphite-border">
                 <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-graphite-text-main mb-2">Exam Complete</h2>
              <p className="text-slate-500 dark:text-graphite-text-sub text-lg">Here is how you performed.</p>
           </div>

           <div className="grid grid-cols-3 gap-6 w-full mb-10">
              <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border text-center shadow-sm">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-2">Accuracy</p>
                 <p className={`text-4xl font-black ${percentage >= 70 ? 'text-emerald-600' : 'text-indigo-600'}`}>{percentage}%</p>
              </div>
              <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border text-center shadow-sm">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-2">Correct</p>
                 <p className="text-4xl font-black text-slate-800 dark:text-graphite-text-main">{correctCount} <span className="text-lg text-slate-400 font-bold">/ {session.questions.length}</span></p>
              </div>
              <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border text-center shadow-sm">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-2">Mode</p>
                 <p className="text-xl font-black text-slate-800 dark:text-graphite-text-main mt-2">{config.mode}</p>
                 <p className="text-[10px] font-bold text-slate-400">{config.difficulty}</p>
              </div>
           </div>

           <div className="w-full bg-white dark:bg-graphite-surface rounded-2xl border border-slate-200 dark:border-graphite-border overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-graphite-base border-b border-slate-200 dark:border-graphite-border flex justify-between">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted">Question Breakdown</span>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                 {session.results.map((res, idx) => {
                    const q = session.questions.find(q => q.id === res.problemId);
                    return (
                       <div key={res.problemId} className="p-4 border-b border-slate-100 dark:border-graphite-border last:border-0 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                             <span className="text-xs font-mono text-slate-400 w-6">0{idx + 1}</span>
                             <span className="text-sm font-bold text-slate-800 dark:text-graphite-text-main truncate max-w-xs">{q?.title}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${res.status === 'Correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {res.status}
                          </span>
                       </div>
                    );
                 })}
                 {/* Fill in skipped if any logic missed (simplified here) */}
              </div>
           </div>

           <div className="mt-8 flex gap-4">
              <button 
                onClick={onClose} 
                className="px-8 py-3 bg-slate-200 dark:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-300 dark:hover:bg-graphite-border transition-colors"
              >
                 Close
              </button>
              <button 
                onClick={() => setStep('CONFIG')} 
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-colors"
              >
                 New Exam
              </button>
           </div>

        </div>
     );
  }

  return null;
};

export default PracticeExam;
