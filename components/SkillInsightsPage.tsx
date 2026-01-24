
import React, { useState, useMemo } from 'react';
import { StudentProfile } from '../types';
import { generateLearningInsights } from '../services/geminiService';
import SkillGraph from './SkillGraph';

interface SkillInsightsPageProps {
  student: StudentProfile;
  onNavigate?: (view: string) => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, colorClass }) => (
  <div className="bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col justify-between h-full hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-all group">
    <div className="flex justify-between items-start mb-2">
       <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
         {icon}
       </div>
    </div>
    <div>
       <h4 className="text-3xl font-black text-slate-800 dark:text-graphite-text-main mb-1">{value}</h4>
       <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-graphite-text-muted">{label}</p>
       {subtext && <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
  </div>
);

const SkillInsightsPage: React.FC<SkillInsightsPageProps> = ({ student, onNavigate }) => {
  const history = student.skillHistory || [];
  
  // AI State
  const [aiObservations, setAiObservations] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasAiFetched, setHasAiFetched] = useState(false);

  // Metrics Calculation
  const metrics = useMemo(() => {
     const streak = student.productivity?.dailyStreak || 0;
     const sessions = student.productivity?.sessionsCompleted || 0;
     
     // Accuracy (last 20 quizzes)
     const recentHistory = history.slice(-20);
     const avgAccuracy = recentHistory.length 
        ? Math.round(recentHistory.reduce((acc, curr) => acc + curr.score, 0) / recentHistory.length) 
        : 0;

     // Mastered Topics (Score >= 80)
     const masteredTopics = new Set(history.filter(h => h.score >= 80).map(h => h.topicId)).size;

     // Velocity (Last 7 days)
     const oneWeekAgo = new Date();
     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
     const weeklyActivity = history.filter(h => new Date(h.date) > oneWeekAgo).length;
     let velocity = "Stable";
     if (weeklyActivity > 10) velocity = "High";
     else if (weeklyActivity > 5) velocity = "Good";
     else if (weeklyActivity === 0) velocity = "Low";

     return { streak, sessions, avgAccuracy, masteredTopics, velocity, weeklyActivity };
  }, [student, history]);

  const hasData = history.length > 0;

  const handleFetchAiCoach = async () => {
    setIsAiLoading(true);
    try {
        const observations = await generateLearningInsights(student);
        setAiObservations(observations);
        setHasAiFetched(true);
    } catch (e) {
        setAiObservations(["Coach is currently offline. Keep practicing!"]);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans min-h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Learning Insights</h1>
           <p className="text-sm font-medium text-slate-500 dark:text-graphite-text-sub">Track your momentum, accuracy, and mastery.</p>
        </div>
        {metrics.streak > 0 && (
           <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-full flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">{metrics.streak} Day Streak</span>
           </div>
        )}
      </div>

      {/* 1. PROGRESS GRAPH */}
      <div className="w-full">
         <SkillGraph data={history} />
      </div>

      {/* 2. GAMIFIED STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard 
            icon={<svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Accuracy"
            value={`${metrics.avgAccuracy}%`}
            colorClass="text-indigo-600 dark:text-indigo-400"
            subtext="Avg. Quiz Score"
         />
         <StatCard 
            icon={<svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
            label="Mastery"
            value={metrics.masteredTopics}
            colorClass="text-emerald-600 dark:text-emerald-400"
            subtext="Topics > 80%"
         />
         <StatCard 
            icon={<svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            label="Velocity"
            value={metrics.velocity}
            colorClass="text-amber-600 dark:text-amber-400"
            subtext={`${metrics.weeklyActivity} activities / week`}
         />
         <StatCard 
            icon={<svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Focus"
            value={metrics.sessions}
            colorClass="text-rose-600 dark:text-rose-400"
            subtext="Sessions Completed"
         />
      </div>

      {/* 3. MOMENTUM SECTION */}
      <div className="bg-slate-900 dark:bg-indigo-900/20 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
               🚀
            </div>
            <div>
               <h3 className="font-bold text-lg">
                  {metrics.streak > 5 ? "Unstoppable Momentum!" : metrics.streak > 2 ? "Heating Up!" : "Start Your Streak"}
               </h3>
               <p className="text-slate-300 dark:text-indigo-200 text-sm">
                  {metrics.streak > 0 
                    ? `You've been consistent for ${metrics.streak} days. Keep it going!` 
                    : "Complete a lesson or quiz today to ignite your streak."}
               </p>
            </div>
         </div>
         {metrics.streak === 0 && (
            <button 
               onClick={() => onNavigate && onNavigate('subject')}
               className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
            >
               Start Learning
            </button>
         )}
      </div>

      {/* 4. AI COACH SECTION */}
      <div className="border-t border-slate-200 dark:border-graphite-border pt-8">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">AI Performance Coach</h3>
            {!hasAiFetched && !isAiLoading && hasData && (
                <button 
                    onClick={handleFetchAiCoach}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-graphite-secondary text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Ask Coach
                </button>
            )}
         </div>

         {isAiLoading && (
            <div className="flex justify-center py-8">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                  Analyzing Habits...
               </div>
            </div>
         )}

         {hasAiFetched && (
            <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-2">
               {aiObservations.map((obs, idx) => (
                  <div key={idx} className="bg-indigo-50/50 dark:bg-graphite-secondary border border-indigo-100 dark:border-indigo-900/20 p-5 rounded-2xl">
                     <div className="flex gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                        <p className="text-sm font-medium text-slate-700 dark:text-graphite-text-main leading-relaxed">{obs}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
         
         {!hasData && (
            <div className="text-center py-10 opacity-50">
               <p className="text-sm font-medium text-slate-400">Complete quizzes to unlock AI coaching insights.</p>
            </div>
         )}
      </div>

    </div>
  );
};

export default SkillInsightsPage;
