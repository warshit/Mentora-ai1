
import React, { useState } from 'react';
import { SkillAnalysisResult, LearningCategory } from '../types';
import { analyzeSkillGaps, generateQuiz } from '../services/geminiService';
import { PulseLoader, DynamicStatusText } from './LoadingState';

interface SkillGapAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPath: (path: SkillAnalysisResult) => void;
}

type Step = 'CHOICE' | 'RESUME_INPUT' | 'QUIZ_SELECT' | 'QUIZ_TAKE' | 'ANALYZING' | 'RESULTS';

const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ isOpen, onClose, onApplyPath }) => {
  const [step, setStep] = useState<Step>('CHOICE');
  const [resumeText, setResumeText] = useState('');
  const [targetTrack, setTargetTrack] = useState('Java Full Stack');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysisResult | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setStep('CHOICE');
    setResumeText('');
    setQuizQuestions([]);
    setQuizAnswers({});
    setAnalysisResult(null);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // --- RESUME FLOW ---
  const handleResumeAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume content.");
      return;
    }
    setStep('ANALYZING');
    const result = await analyzeSkillGaps(resumeText, 'RESUME', targetTrack);
    if (result) {
      setAnalysisResult(result);
      setStep('RESULTS');
    } else {
      setError("Analysis failed. Please try again.");
      setStep('RESUME_INPUT');
    }
  };

  // --- QUIZ FLOW ---
  const handleStartQuiz = async () => {
    setStep('ANALYZING'); // Loading state while generating quiz
    const questions = await generateQuiz("CAREER-DIAGNOSTIC", `Diagnostic Test for ${targetTrack}`, "Core Skills", null, false);
    if (questions.length > 0) {
      setQuizQuestions(questions);
      setStep('QUIZ_TAKE');
    } else {
      setError("Failed to generate diagnostic test.");
      setStep('QUIZ_SELECT');
    }
  };

  const handleQuizSubmit = async () => {
    setStep('ANALYZING');
    // Summarize performance
    let correct = 0;
    let summary = `Target Track: ${targetTrack}. Quiz Results:\n`;
    quizQuestions.forEach((q, idx) => {
      const isCorrect = quizAnswers[idx] === q.correctAnswerIndex;
      if (isCorrect) correct++;
      summary += `- Q: ${q.question} | Result: ${isCorrect ? 'Correct' : 'Incorrect'}\n`;
    });
    summary += `Total Score: ${correct}/${quizQuestions.length}`;

    const result = await analyzeSkillGaps(summary, 'TEST_RESULTS', targetTrack);
    if (result) {
      setAnalysisResult(result);
      setStep('RESULTS');
    } else {
      setError("Analysis failed. Please try again.");
      setStep('QUIZ_TAKE');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-graphite-surface rounded-[2rem] w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-graphite-border flex flex-col max-h-[90vh] overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-graphite-border flex justify-between items-center bg-white dark:bg-graphite-surface sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main border border-indigo-100 dark:border-graphite-border">
                 Upskill Intelligence
               </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Skill Gap Detector</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-graphite-secondary rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-50 dark:bg-graphite-base">
          
          {/* STEP: CHOICE */}
          {step === 'CHOICE' && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in-95 duration-300">
               <div className="text-center max-w-lg">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-3">How should we analyze your skills?</h3>
                  <p className="text-slate-500 dark:text-graphite-text-sub">Choose a method to identify your strengths and discover your personalized learning path.</p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                  <button 
                    onClick={() => setStep('RESUME_INPUT')}
                    className="group relative bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border hover:border-indigo-500 dark:hover:border-graphite-text-main transition-all shadow-sm hover:shadow-xl text-left"
                  >
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-graphite-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7 text-indigo-600 dark:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </div>
                     <h4 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main mb-2">Analyze My Resume</h4>
                     <p className="text-sm text-slate-500 dark:text-graphite-text-sub leading-relaxed">Paste your resume content. AI will extract your current stack and map it against industry requirements.</p>
                  </button>

                  <button 
                    onClick={() => setStep('QUIZ_SELECT')}
                    className="group relative bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border hover:border-emerald-500 dark:hover:border-emerald-400 transition-all shadow-sm hover:shadow-xl text-left"
                  >
                     <div className="w-14 h-14 bg-emerald-50 dark:bg-graphite-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                     </div>
                     <h4 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main mb-2">Take Diagnostic Test</h4>
                     <p className="text-sm text-slate-500 dark:text-graphite-text-sub leading-relaxed">Answer a few adaptive questions to check your conceptual clarity and problem-solving depth.</p>
                  </button>
               </div>
            </div>
          )}

          {/* STEP: RESUME INPUT */}
          {step === 'RESUME_INPUT' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="mb-6">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted mb-2 block">Target Role</label>
                  <select 
                    value={targetTrack} 
                    onChange={(e) => setTargetTrack(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border rounded-xl font-bold text-slate-800 dark:text-graphite-text-main outline-none focus:border-indigo-500 transition-all"
                  >
                     <option>Java Full Stack Developer</option>
                     <option>Data Scientist</option>
                     <option>Machine Learning Engineer</option>
                     <option>Frontend Developer (React)</option>
                     <option>Backend Developer (Spring Boot)</option>
                  </select>
               </div>
               
               <div className="mb-8">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted mb-2 block">Resume Content</label>
                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the text from your Resume/CV here..."
                    className="w-full h-64 p-5 rounded-2xl border border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface text-sm font-mono leading-relaxed outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted"
                  />
                  {error && <p className="text-rose-500 text-xs font-bold mt-2">{error}</p>}
               </div>

               <div className="flex justify-end gap-3">
                  <button onClick={() => setStep('CHOICE')} className="px-6 py-3 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">Back</button>
                  <button onClick={handleResumeAnalyze} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg">Analyze Resume</button>
               </div>
            </div>
          )}

          {/* STEP: QUIZ SELECT */}
          {step === 'QUIZ_SELECT' && (
             <div className="max-w-xl mx-auto flex flex-col justify-center h-full animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main mb-6 text-center">Select Your Track</h3>
                <div className="space-y-4">
                   {['Java Full Stack', 'Data Science', 'Machine Learning', 'Web Development'].map(track => (
                      <button 
                        key={track}
                        onClick={() => { setTargetTrack(track); handleStartQuiz(); }} // This triggers loading then quiz take
                        className="w-full p-5 bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border rounded-2xl text-left hover:border-indigo-500 dark:hover:border-graphite-text-main hover:shadow-md transition-all flex justify-between items-center group"
                      >
                         <span className="font-bold text-slate-800 dark:text-graphite-text-main">{track}</span>
                         <span className="text-slate-300 dark:text-graphite-text-disabled group-hover:text-indigo-500 dark:group-hover:text-graphite-text-main transition-colors">Start &rarr;</span>
                      </button>
                   ))}
                </div>
                <button onClick={() => setStep('CHOICE')} className="mt-8 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-700 transition-colors text-center">Cancel</button>
             </div>
          )}

          {/* STEP: ANALYZING */}
          {step === 'ANALYZING' && (
             <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-6 relative">
                   <div className="absolute inset-0 border-4 border-indigo-100 dark:border-graphite-border rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-600 dark:border-graphite-action rounded-full border-t-transparent animate-spin"></div>
                   <svg className="w-10 h-10 text-indigo-600 dark:text-graphite-text-main animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main mb-2">Analyzing Skill Set</h3>
                <DynamicStatusText context={targetTrack} />
             </div>
          )}

          {/* STEP: QUIZ TAKE */}
          {step === 'QUIZ_TAKE' && (
             <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-end border-b border-slate-200 dark:border-graphite-border pb-4">
                   <div>
                      <span className="text-xs font-black text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">Diagnostic Test</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main">{targetTrack}</h3>
                   </div>
                   <span className="text-sm font-bold text-indigo-600 dark:text-graphite-text-main">{Object.keys(quizAnswers).length} / {quizQuestions.length} Answered</span>
                </div>

                <div className="space-y-6">
                   {quizQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm">
                         <p className="font-bold text-slate-800 dark:text-graphite-text-main mb-4 flex gap-3">
                            <span className="text-slate-300 dark:text-graphite-text-muted select-none">{idx + 1}.</span> 
                            {q.question}
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt: string, optIdx: number) => (
                               <button 
                                 key={optIdx}
                                 onClick={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                                 className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border
                                    ${quizAnswers[idx] === optIdx 
                                       ? 'bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base border-indigo-600 dark:border-graphite-action shadow-md' 
                                       : 'bg-slate-50 dark:bg-graphite-secondary text-slate-600 dark:text-graphite-text-sub border-transparent hover:bg-slate-100 dark:hover:bg-graphite-border'}
                                 `}
                               >
                                  {opt}
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="flex justify-end pt-4">
                   <button 
                     onClick={handleQuizSubmit}
                     disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                     className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:scale-100"
                   >
                      Submit & Analyze
                   </button>
                </div>
             </div>
          )}

          {/* STEP: RESULTS */}
          {step === 'RESULTS' && analysisResult && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Summary Card */}
                <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-graphite-text-sub mb-2 block">Analysis Report</span>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main mb-4 leading-tight">{analysisResult.roleMatch || "Skill Analysis Complete"}</h3>
                      <p className="text-slate-600 dark:text-graphite-text-sub leading-relaxed">{analysisResult.summary}</p>
                   </div>
                   
                   {/* Strong Skills */}
                   <div className="w-full md:w-1/3 bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         Strong Foundation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {analysisResult.strongSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-white dark:bg-graphite-surface text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-sm">{skill}</span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   
                   {/* Gaps */}
                   <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-graphite-text-main mb-6 flex items-center gap-2">
                         <span className="w-2 h-6 bg-rose-500 rounded-full"></span> Critical Gaps
                      </h4>
                      <div className="space-y-4">
                         {analysisResult.gaps.map((gap, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-graphite-surface border border-rose-100 dark:border-rose-900/20 rounded-xl shadow-sm">
                               <div>
                                  <p className="font-bold text-slate-800 dark:text-graphite-text-main">{gap.skill}</p>
                                  <p className="text-xs text-slate-500 dark:text-graphite-text-sub mt-0.5">{gap.level} Gap</p>
                               </div>
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                                  ${gap.priority === 'Critical' ? 'bg-rose-500 text-white' : 
                                    gap.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}
                               `}>
                                  {gap.priority}
                               </span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Roadmap */}
                   <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-graphite-text-main mb-6 flex items-center gap-2">
                         <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> Recommended Path
                      </h4>
                      <div className="relative border-l-2 border-slate-200 dark:border-graphite-border ml-3 space-y-8 pb-4">
                         {analysisResult.path.map((step, i) => (
                            <div key={i} className="relative pl-8">
                               <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-graphite-base border-4 border-indigo-500 dark:border-graphite-action"></div>
                               <div>
                                  <span className="text-[9px] font-black text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest mb-1 block">Step 0{step.step} • {step.estimatedHours}</span>
                                  <h5 className="font-bold text-slate-900 dark:text-graphite-text-main text-base">{step.topic}</h5>
                                  <p className="text-xs text-slate-500 dark:text-graphite-text-sub mt-1 leading-relaxed">{step.focus}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                </div>

                <div className="flex justify-center pt-6 border-t border-slate-100 dark:border-graphite-border">
                   <button 
                     onClick={() => { onApplyPath(analysisResult); handleClose(); }}
                     className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-3"
                   >
                      Activate Personalized Plan
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </button>
                </div>

             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
