import React, { useState, useEffect } from 'react';
import { PracticeQuestion, Subject, Topic, LearningCategory } from '../types';
import { generatePracticeQuestions } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { SkeletonLine, PulseLoader } from './LoadingState';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  topic: Topic;
  category: LearningCategory;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, onClose, subject, topic, category }) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuestions();
    }
  }, [isOpen, topic.id]);

  const loadQuestions = async () => {
    // 1. Initialize State
    setIsLoading(true);
    setError(null);
    setQuestions([]);

    // 2. Safety Validation
    if (!subject?.name || !topic?.name) {
       setError("Invalid topic context. Please try selecting the topic again.");
       setIsLoading(false);
       return;
    }

    try {
        // 3. AI Request
        const result = await generatePracticeQuestions(subject.name, topic.name, category);
        
        // 4. Validate Result
        if (result && result.length > 0) {
            setQuestions(result);
        } else {
            setError("We couldn't generate questions for this topic right now. It might be too specific or niche.");
        }
    } catch (e: any) {
        // 5. Catch Exceptions
        console.error("Practice Load Error:", e);
        if (e.message === 'AI_TIMEOUT') {
            setError("The AI is taking longer than expected. Please try generating again.");
        } else {
            setError("Connection interrupted. Please check your internet and try again.");
        }
    } finally {
        // 6. Mandatory Cleanup
        setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    loadQuestions();
  };

  if (!isOpen) return null;

  const isUpskill = category === LearningCategory.UPSKILL;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-graphite-surface w-full h-full md:h-auto md:max-h-[85vh] md:rounded-[2rem] md:max-w-3xl shadow-2xl border border-slate-200 dark:border-graphite-border flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-graphite-border flex justify-between items-center bg-white dark:bg-graphite-surface md:rounded-t-[2rem] sticky top-0 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isUpskill ? 'bg-amber-50 dark:bg-graphite-secondary text-amber-700 dark:text-graphite-text-main border-amber-100 dark:border-graphite-border' : 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main border-indigo-100 dark:border-graphite-border'}`}>
                 {isUpskill ? 'Interview Prep' : 'Exam Practice'}
               </span>
               <span className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest truncate max-w-[100px] md:max-w-[150px]">{topic.name}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Practice Set</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-graphite-secondary rounded-full transition-colors text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50 dark:bg-graphite-base">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm">
                   <div className="flex justify-between mb-4">
                      <SkeletonLine width="w-24" height="h-4" />
                      <SkeletonLine width="w-16" height="h-4" />
                   </div>
                   <SkeletonLine width="w-3/4" height="h-6" className="mb-2" />
                   <SkeletonLine width="w-1/2" height="h-6" />
                </div>
              ))}
              <div className="flex justify-center pt-4">
                 <div className="flex items-center gap-2 text-slate-400 dark:text-graphite-text-muted text-xs font-bold uppercase tracking-widest">
                    <PulseLoader />
                    Generating {isUpskill ? 'Interview Scenarios' : 'Exam Questions'}...
                 </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center animate-in fade-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-rose-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main mb-2">Generation Failed</h3>
               <p className="text-slate-500 dark:text-graphite-text-sub text-sm max-w-xs mb-6">{error}</p>
               <button 
                 onClick={handleRegenerate}
                 className="px-6 py-2 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
               >
                 Retry Generation
               </button>
            </div>
          ) : questions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-10 text-center">
               <p className="text-slate-400 dark:text-graphite-text-muted font-bold text-sm">No practice questions found for this topic.</p>
               <button 
                 onClick={handleRegenerate} 
                 className="mt-4 text-indigo-600 dark:text-graphite-text-main text-xs font-bold uppercase tracking-widest hover:underline"
               >
                 Try Again
               </button>
             </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-graphite-surface rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm overflow-hidden transition-all hover:shadow-md animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                   
                   {/* Question Header */}
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${q.difficulty === 'Hard' ? 'bg-rose-50 dark:bg-graphite-secondary text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' : 'bg-slate-100 dark:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub border-slate-200 dark:border-graphite-border'}`}>
                           {q.difficulty}
                         </span>
                         <span className="text-slate-300 dark:text-graphite-text-muted font-black text-4xl opacity-20">0{idx + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main mb-2 leading-relaxed">
                        {q.question}
                      </h3>
                   </div>

                   {/* Toggle Answer */}
                   <div className="border-t border-slate-100 dark:border-graphite-border">
                      <button 
                        onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                        className={`w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-between transition-colors
                          ${expandedId === idx 
                             ? 'bg-slate-50 dark:bg-graphite-secondary text-indigo-600 dark:text-graphite-text-main' 
                             : 'hover:bg-slate-50 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub'}
                        `}
                      >
                         {expandedId === idx ? 'Hide Solution' : 'Reveal Solution'}
                         <svg className={`w-4 h-4 transition-transform ${expandedId === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                   </div>

                   {/* Answer Content */}
                   {expandedId === idx && (
                      <div className="bg-slate-50 dark:bg-graphite-secondary p-6 border-t border-slate-100 dark:border-graphite-border animate-in slide-in-from-top-2 duration-300">
                         <div className="mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Correct Answer</span>
                            <div className="text-sm font-medium text-slate-800 dark:text-graphite-text-main">
                               <MarkdownRenderer content={q.answer} />
                            </div>
                         </div>
                         <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 block">{isUpskill ? 'Complexity Analysis' : 'Explanation'}</span>
                            <div className="text-sm text-slate-600 dark:text-graphite-text-sub leading-relaxed">
                               <MarkdownRenderer content={q.explanation} />
                            </div>
                         </div>
                      </div>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeModal;