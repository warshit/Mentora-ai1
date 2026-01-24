
import React from 'react';
import { DSA_CURRICULUM } from '../constants';
import { DSASection, DSAProblem, DSAProgress } from '../types';

interface DSAHubProps {
  onSelectProblem: (problem: DSAProblem) => void;
  onBack: () => void;
  progress: DSAProgress;
}

const DSAHub: React.FC<DSAHubProps> = ({ onSelectProblem, onBack, progress }) => {
  const stats = React.useMemo(() => {
    let solvedEasy = 0, solvedMedium = 0, solvedHard = 0;
    let totalEasy = 0, totalMedium = 0, totalHard = 0;
    let totalSolved = 0, totalProblems = 0;

    DSA_CURRICULUM.forEach(section => {
      section.problems.forEach(p => {
        totalProblems++;
        if (p.difficulty === 'Easy') totalEasy++;
        else if (p.difficulty === 'Medium') totalMedium++;
        else if (p.difficulty === 'Hard') totalHard++;

        if (progress[p.id]?.status === 'Solved') {
          totalSolved++;
          if (p.difficulty === 'Easy') solvedEasy++;
          else if (p.difficulty === 'Medium') solvedMedium++;
          else if (p.difficulty === 'Hard') solvedHard++;
        }
      });
    });
    return { solvedEasy, solvedMedium, solvedHard, totalEasy, totalMedium, totalHard, totalSolved, totalProblems };
  }, [progress]);

  const getPercentage = (solved: number, total: number) => total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-8 pb-8 border-b border-slate-200 dark:border-graphite-border">
        <div className="flex justify-between items-start">
            <div>
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main mb-3 transition-colors"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                Back to Upskill
            </button>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-graphite-text-main tracking-tight">DSA Practice Hub</h1>
            <p className="text-slate-500 dark:text-graphite-text-sub mt-2 text-lg font-medium">
                Master Data Structures and Algorithms with LeetCode-style practice.
            </p>
            </div>
        </div>

        {/* Progress Breakdown */}
        <div className="bg-white dark:bg-graphite-surface p-6 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left min-w-[150px]">
                <p className="text-sm font-bold text-slate-500 dark:text-graphite-text-muted mb-1">Total Solved</p>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="text-4xl font-black text-slate-900 dark:text-graphite-text-main">{stats.totalSolved}</span>
                    <span className="text-lg font-bold text-slate-400 dark:text-graphite-text-muted">/ {stats.totalProblems}</span>
                </div>
            </div>

            <div className="flex-1 w-full space-y-3">
                {/* Easy */}
                <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                        <span className="text-slate-400 dark:text-graphite-text-muted">{stats.solvedEasy} / {stats.totalEasy}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${getPercentage(stats.solvedEasy, stats.totalEasy)}%` }}></div>
                    </div>
                </div>
                {/* Medium */}
                <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-amber-600 dark:text-amber-400">Medium</span>
                        <span className="text-slate-400 dark:text-graphite-text-muted">{stats.solvedMedium} / {stats.totalMedium}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${getPercentage(stats.solvedMedium, stats.totalMedium)}%` }}></div>
                    </div>
                </div>
                {/* Hard */}
                <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-rose-600 dark:text-rose-400">Hard</span>
                        <span className="text-slate-400 dark:text-graphite-text-muted">{stats.solvedHard} / {stats.totalHard}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${getPercentage(stats.solvedHard, stats.totalHard)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid gap-12">
        {DSA_CURRICULUM.map((section: DSASection) => (
          <div key={section.id} className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-600 dark:bg-graphite-action rounded-full"></span>
                    {section.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-graphite-text-sub mt-1 ml-5 font-medium">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.problems.map((problem) => {
                    const problemStatus = progress[problem.id]?.status;
                    const isSolved = problemStatus === 'Solved';
                    const isAttempted = problemStatus === 'Attempted';

                    return (
                    <div 
                        key={problem.id}
                        onClick={() => onSelectProblem(problem)}
                        className={`group bg-white dark:bg-graphite-surface p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden
                            ${isSolved 
                                ? 'border-emerald-200 dark:border-emerald-900/30 shadow-sm' 
                                : 'border-slate-200 dark:border-graphite-border hover:border-indigo-300 dark:hover:border-graphite-text-sub shadow-sm hover:shadow-md'}
                        `}
                    >
                        {isSolved && (
                            <div className="absolute top-0 right-0 p-2">
                                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border
                                    ${problem.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                      problem.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                      'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'}
                                `}>{problem.difficulty}</span>
                                
                                {isAttempted && !isSolved && (
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">Attempted</span>
                                )}
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{problem.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {problem.topics.map(t => (
                                    <span key={t} className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted bg-slate-100 dark:bg-graphite-secondary px-2 py-0.5 rounded">{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <span className="text-xs font-bold text-indigo-600 dark:text-graphite-text-main group-hover:underline decoration-2 underline-offset-4">
                                {isSolved ? 'Review Solution' : 'Solve Challenge'} &rarr;
                            </span>
                        </div>
                    </div>
                );})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DSAHub;
