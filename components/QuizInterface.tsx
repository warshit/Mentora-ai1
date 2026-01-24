
import React, { useState, useEffect } from 'react';
import { QuizConfig } from '../types';

interface QuizInterfaceProps {
  config: QuizConfig;
  onClose: () => void;
  onRetake: () => void;
  onComplete: (score: number, total: number) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ config, onClose, onRetake, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);

  useEffect(() => {
    if (submitted) {
      // Simple animation for score
      const score = calculateScore();
      const percentage = Math.round((score / config.questions.length) * 100);
      let start = 0;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart
        const ease = 1 - Math.pow(1 - progress, 4);
        
        setAnimateScore(Math.round(ease * percentage));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [submitted]);

  const handleOptionSelect = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    config.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    onComplete(score, config.questions.length);
  };

  const score = calculateScore();
  const percentage = Math.round((score / config.questions.length) * 100);
  const isPass = percentage >= 70;
  
  // Circular Progress Logic
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animateScore / 100) * circumference;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-graphite-base relative overflow-hidden font-sans">
      {/* Quiz Header */}
      <div className="bg-white dark:bg-graphite-surface px-6 md:px-10 py-5 border-b border-slate-200 dark:border-graphite-border flex justify-between items-center shadow-sm z-20">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-slate-100 dark:bg-graphite-secondary text-slate-500 dark:text-graphite-text-sub border border-slate-200 dark:border-graphite-border`}>
              {config.type} Assessment
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted">
               {submitted ? 'Performance Report' : `Question ${currentQuestion + 1} / ${config.questions.length}`}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight truncate max-w-md">{config.title}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 bg-slate-50 dark:bg-graphite-base hover:bg-slate-100 dark:hover:bg-graphite-secondary rounded-xl transition-colors text-slate-400 dark:text-graphite-text-muted hover:text-rose-500 dark:hover:text-graphite-text-main border border-transparent hover:border-slate-200 dark:hover:border-graphite-border"
          title="Exit Quiz"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!submitted ? (
          <div className="max-w-4xl mx-auto p-6 md:p-10 h-full flex flex-col justify-center">
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-graphite-border rounded-full mb-12 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-graphite-action transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                style={{ width: `${((currentQuestion + 1) / config.questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-graphite-text-main mb-10 leading-snug">
                {config.questions[currentQuestion].question}
              </h3>

              <div className="grid gap-4">
                {config.questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex items-center gap-5 group relative overflow-hidden
                      ${selectedAnswers[currentQuestion] === idx 
                        ? 'border-indigo-600 dark:border-graphite-action bg-indigo-50 dark:bg-graphite-secondary text-indigo-900 dark:text-graphite-text-main shadow-lg scale-[1.01]' 
                        : 'border-slate-100 dark:border-graphite-border hover:border-indigo-300 dark:hover:border-graphite-text-sub bg-white dark:bg-graphite-surface text-slate-700 dark:text-graphite-text-sub hover:shadow-md'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-black transition-colors shrink-0
                      ${selectedAnswers[currentQuestion] === idx 
                        ? 'border-indigo-600 dark:border-graphite-action bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base' 
                        : 'border-slate-200 dark:border-graphite-border text-slate-400 dark:text-graphite-text-muted group-hover:border-indigo-400 dark:group-hover:border-graphite-text-sub bg-slate-50 dark:bg-graphite-base'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-bold text-lg">{option}</span>
                    
                    {selectedAnswers[currentQuestion] === idx && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <svg className="w-6 h-6 text-indigo-600 dark:text-graphite-action" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100 dark:border-graphite-border">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-transparent border border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:border-graphite-border dark:text-graphite-text-sub dark:hover:bg-graphite-secondary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              
              {currentQuestion === config.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < config.questions.length}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-3 dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white"
                >
                  Submit Assessment
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(config.questions.length - 1, prev + 1))}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* --- RESULT HEADER --- */}
            <div className="bg-white dark:bg-graphite-surface rounded-[3rem] p-10 md:p-12 shadow-2xl border border-slate-200 dark:border-graphite-border text-center mb-12 relative overflow-hidden group">
               {/* Background Glow */}
               <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full blur-[100px] opacity-20 pointer-events-none ${isPass ? 'bg-emerald-400 dark:bg-graphite-success' : 'bg-rose-400 dark:bg-graphite-error'}`}></div>

               <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
                  {/* Circular Score */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100 dark:text-graphite-secondary" />
                        <circle 
                            cx="96" cy="96" r={radius} 
                            stroke="currentColor" 
                            strokeWidth="16" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ease-out ${isPass ? 'text-emerald-500 dark:text-graphite-success' : 'text-rose-500 dark:text-graphite-error'}`}
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-black ${isPass ? 'text-emerald-600 dark:text-graphite-text-main' : 'text-rose-600 dark:text-graphite-text-main'}`}>{animateScore}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mt-1">Score</span>
                     </div>
                  </div>

                  {/* Text Outcome */}
                  <div className="text-center md:text-left max-w-md">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-graphite-text-muted mb-2">
                        {isPass ? 'Assessment Passed' : 'Assessment Failed'}
                     </h3>
                     <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-graphite-text-main mb-6 leading-tight">
                        {percentage >= 90 ? "Outstanding Mastery!" :
                         percentage >= 70 ? "Solid Understanding." :
                         "Needs Revision."}
                     </h2>
                     <p className="text-lg font-medium text-slate-600 dark:text-graphite-text-sub mb-8 leading-relaxed">
                        {percentage >= 90 ? "You've demonstrated excellent command of this topic. Ready for the next challenge." :
                         percentage >= 70 ? "You have a good grasp of the concepts, but there's still room to sharpen your skills." :
                         "This topic appears to be a weak point. We strongly recommend reviewing the notes and key concepts before moving forward."}
                     </p>
                     
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button onClick={onRetake} className="px-6 py-3 bg-white dark:bg-graphite-secondary border border-indigo-600 text-indigo-600 dark:border-graphite-border dark:text-graphite-text-main hover:bg-indigo-50 dark:hover:bg-graphite-input font-bold rounded-xl transition-colors text-sm shadow-sm">
                           Retake Assessment
                        </button>
                        <button onClick={onClose} className={`px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white`}>
                           {isPass ? 'Continue Learning' : 'Review Study Material'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- DETAILED ANALYSIS --- */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6 px-2">
                <h4 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main">Answer Breakdown</h4>
                <div className="flex gap-4 text-xs font-bold">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-graphite-success"></div> Correct
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 dark:bg-graphite-error"></div> Incorrect
                   </div>
                </div>
              </div>

              {config.questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
                const userAnswerIdx = selectedAnswers[idx];

                return (
                  <div key={idx} className={`bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border shadow-sm transition-all
                     ${isCorrect 
                        ? 'border-emerald-200 dark:border-graphite-success shadow-emerald-100/50 dark:shadow-none' 
                        : 'border-rose-200 dark:border-graphite-error shadow-rose-100/50 dark:shadow-none'}
                  `}>
                    <div className="flex gap-6 items-start">
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-white dark:text-graphite-base shadow-md mt-1
                         ${isCorrect ? 'bg-emerald-500 dark:bg-graphite-success' : 'bg-rose-500 dark:bg-graphite-error'}
                      `}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xl text-slate-900 dark:text-graphite-text-main mb-6 leading-snug">{q.question}</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {q.options.map((opt, optIdx) => {
                             const isSelected = userAnswerIdx === optIdx;
                             const isTheCorrectOne = optIdx === q.correctAnswerIndex;
                             
                             let statusClass = "bg-slate-50 dark:bg-graphite-base border-slate-100 dark:border-graphite-border text-slate-500 dark:text-graphite-text-muted";
                             if (isTheCorrectOne) statusClass = "bg-emerald-50 dark:bg-graphite-secondary border-emerald-200 dark:border-graphite-success text-emerald-800 dark:text-graphite-text-main font-bold ring-1 ring-emerald-500/20 dark:ring-0";
                             if (isSelected && !isTheCorrectOne) statusClass = "bg-rose-50 dark:bg-graphite-secondary border-rose-200 dark:border-graphite-error text-rose-800 dark:text-graphite-text-main font-bold ring-1 ring-rose-500/20 dark:ring-0";

                             return (
                                <div key={optIdx} className={`p-4 rounded-xl border text-sm flex justify-between items-center ${statusClass}`}>
                                   <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border
                                         ${isTheCorrectOne ? 'bg-emerald-500 border-emerald-500 text-white dark:bg-graphite-success dark:border-graphite-success dark:text-graphite-base' : 
                                           (isSelected && !isTheCorrectOne) ? 'bg-rose-500 border-rose-500 text-white dark:bg-graphite-error dark:border-graphite-error dark:text-graphite-base' : 
                                           'bg-white dark:bg-graphite-surface border-slate-300 dark:border-graphite-text-muted text-slate-400 dark:text-graphite-text-muted'}
                                      `}>
                                         {String.fromCharCode(65 + optIdx)}
                                      </div>
                                      <span>{opt}</span>
                                   </div>
                                   {isTheCorrectOne && <svg className="w-5 h-5 text-emerald-500 dark:text-graphite-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                                   {isSelected && !isTheCorrectOne && <svg className="w-5 h-5 text-rose-500 dark:text-graphite-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>}
                                </div>
                             )
                          })}
                        </div>

                        <div className="bg-slate-50 dark:bg-graphite-base p-6 rounded-2xl text-sm leading-relaxed border border-slate-200 dark:border-graphite-border">
                          <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-graphite-text-main">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span className="font-black uppercase tracking-widest text-[10px]">Explanation</span>
                          </div>
                          <p className="text-slate-600 dark:text-graphite-text-sub">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-20"></div> {/* Spacer */}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
