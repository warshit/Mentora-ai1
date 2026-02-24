
import React, { useMemo, useState, useEffect } from 'react';
import { Subject, StudentProfile, StudySession } from '../types';

interface PerformanceAnalyticsProps {
  subjects: Subject[];
  student: StudentProfile;
  sessions: StudySession[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ subjects, student, sessions }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  // --- ANALYTICS LOGIC ---

  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    
    // Subject Mastery Calculation
    const subjectMastery = subjects.map(sub => {
      const subTotal = sub.units.reduce((acc, u) => acc + u.topics.length, 0);
      const subCompleted = sub.units.reduce((acc, u) => acc + u.topics.filter(t => t.status === 'Completed').length, 0);
      const subPracticed = sub.units.reduce((acc, u) => acc + u.topics.filter(t => t.status === 'Practiced').length, 0);
      
      // Weighted Score: Completed (1.0) + Practiced (0.5)
      const rawScore = subCompleted + (subPracticed * 0.5);
      const percentage = subTotal > 0 ? Math.round((rawScore / subTotal) * 100) : 0;
      
      totalTopics += subTotal;
      completedTopics += subCompleted;

      return {
        ...sub,
        percentage,
        status: percentage >= 80 ? 'Mastery' : percentage >= 40 ? 'Developing' : 'Foundational'
      };
    });

    // Overall Readiness
    const overallReadiness = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Level Calculation (Gamification)
    // Level = 1 + (Total Completed / 5)
    const currentLevel = 1 + Math.floor(completedTopics / 5);
    const nextLevelProgress = (completedTopics % 5) / 5 * 100;

    // Activity Rhythm (Last 7 Days)
    const today = new Date();
    const activityData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      // Count sessions updated on this date
      const count = sessions.filter(s => {
        const sDate = new Date(s.lastUpdated).toISOString().split('T')[0];
        return sDate === dateStr;
      }).length;

      return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), count, fullDate: dateStr };
    });

    // Milestones (Recent Skill History)
    const recentMilestones = [...(student.skillHistory || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    return {
      subjectMastery,
      overallReadiness,
      currentLevel,
      nextLevelProgress,
      activityData,
      recentMilestones,
      streak: student.productivity?.dailyStreak || 0
    };
  }, [subjects, student, sessions]);

  // --- VISUAL HELPERS ---

  const getStatusGradient = (status: string) => {
    switch(status) {
      case 'Mastery': return 'from-emerald-500 to-teal-400';
      case 'Developing': return 'from-indigo-500 to-blue-400';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  // Circular Progress Vars
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.overallReadiness / 100) * circumference;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 font-sans">
      
      {/* 1. HERO SECTION: MASTERY & LEVEL */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Introduction & Level */}
        <div className="flex flex-col items-start space-y-6">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-graphite-border">
                 My Analytics
              </span>
              {stats.streak > 2 && (
                 <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500 dark:text-orange-400 animate-pulse">
                    <span className="text-sm">🔥</span> {stats.streak} Day Streak
                 </span>
              )}
           </div>
           
           <div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-graphite-text-main mb-4 tracking-tight leading-[1.1]">
                Your Knowledge <br/>
                <span className="text-indigo-600 dark:text-indigo-400">Momentum</span>
             </h1>
             <p className="text-slate-500 dark:text-graphite-text-sub text-lg font-medium max-w-md leading-relaxed">
                You are currently at <strong className="text-slate-800 dark:text-graphite-text-main">Level {stats.currentLevel}</strong>. 
                Keep mastering topics to unlock the next tier of academic proficiency.
             </p>
           </div>

           {/* Level Bar */}
           <div className="w-full max-w-md bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-100 dark:border-graphite-border shadow-sm">
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-graphite-text-muted mb-3 uppercase tracking-wider">
                 <span>Level {stats.currentLevel}</span>
                 <span>Level {stats.currentLevel + 1}</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden p-0.5">
                 <div 
                    className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]`} 
                    style={{ width: animate ? `${stats.nextLevelProgress}%` : '0%' }}
                 ></div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted mt-2 text-right font-medium">
                 {Math.round(stats.nextLevelProgress)}% to next level
              </p>
           </div>
        </div>

        {/* Right: Circular Mastery Indicator */}
        <div className="flex justify-center md:justify-end py-4">
           <div className="relative w-72 h-72">
              {/* Background Blob */}
              <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              
              <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-2xl">
                 {/* Track */}
                 <circle
                   cx="144"
                   cy="144"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="16"
                   fill="transparent"
                   className="text-white dark:text-graphite-secondary"
                 />
                 {/* Progress */}
                 <circle
                   cx="144"
                   cy="144"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="16"
                   fill="transparent"
                   strokeDasharray={circumference}
                   strokeDashoffset={animate ? strokeDashoffset : circumference}
                   strokeLinecap="round"
                   className="text-indigo-600 dark:text-graphite-action transition-all duration-[1.5s] ease-out"
                 />
              </svg>
              
              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-graphite-text-muted mb-2">Total Mastery</span>
                 <span className="text-7xl font-black text-slate-900 dark:text-graphite-text-main tracking-tighter">
                    {animate ? stats.overallReadiness : 0}%
                 </span>
                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                    {stats.overallReadiness > 80 ? 'Excellent' : stats.overallReadiness > 50 ? 'Good Progress' : 'Just Started'}
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* 2. WEEKLY RHYTHM (Consistency) */}
      <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2.5rem] border border-slate-200 dark:border-graphite-border shadow-sm">
         <div className="flex justify-between items-end mb-10 border-b border-slate-100 dark:border-graphite-border pb-6">
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main mb-1">Weekly Rhythm</h3>
               <p className="text-slate-500 dark:text-graphite-text-sub text-sm font-medium">Your study consistency over the last 7 days.</p>
            </div>
            <div className="hidden sm:block">
               <span className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted bg-slate-50 dark:bg-graphite-base px-3 py-1 rounded-lg">Last 7 Days</span>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-4 h-40 items-end">
            {stats.activityData.map((d, i) => {
               const heightPercent = Math.min(100, Math.max(10, d.count * 20)); // Scale activity
               const isToday = i === 6;
               
               return (
                  <div key={i} className="flex flex-col items-center gap-3 group h-full justify-end">
                     <div className="w-full flex-1 flex items-end justify-center relative">
                        <div 
                           className={`w-full rounded-xl transition-all duration-700 ease-out relative group-hover:scale-105
                              ${isToday 
                                 ? 'bg-indigo-600 dark:bg-graphite-action shadow-lg shadow-indigo-200 dark:shadow-none' 
                                 : 'bg-slate-100 dark:bg-graphite-secondary hover:bg-indigo-200 dark:hover:bg-graphite-border'}
                           `}
                           style={{ height: animate ? `${heightPercent}%` : '0%' }}
                        >
                           {/* Tooltip */}
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl transform translate-y-2 group-hover:translate-y-0">
                              {d.count} Sessions
                           </div>
                        </div>
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}>
                        {d.day}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* 3. SKILL STRENGTH MAP (Span 8) */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4">
               <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main whitespace-nowrap">Subject Strength Map</h3>
               <div className="h-px bg-slate-200 dark:bg-graphite-border w-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
               {stats.subjectMastery.map((sub, i) => (
                  <div 
                     key={sub.id} 
                     className="bg-white dark:bg-graphite-surface p-6 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-graphite-text-sub transition-all group flex flex-col h-full"
                     style={{ transitionDelay: `${i * 50}ms` }}
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${getStatusGradient(sub.status)} transform group-hover:scale-110 transition-transform duration-300`}>
                           <span className="text-sm font-black">{sub.percentage}%</span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           sub.status === 'Mastery' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                           sub.status === 'Developing' ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30' :
                           'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                           {sub.status}
                        </span>
                     </div>
                     
                     <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-graphite-text-main mb-1 text-lg leading-tight line-clamp-2" title={sub.name}>{sub.name}</h4>
                        <p className="text-xs text-slate-400 dark:text-graphite-text-muted font-mono mt-1">{sub.code}</p>
                     </div>
                     
                     <div className="mt-6 w-full h-2 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getStatusGradient(sub.status)}`} 
                           style={{ width: animate ? `${sub.percentage}%` : '0%' }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. RECENT MILESTONES (Span 4) */}
         <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
               <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main whitespace-nowrap">Recent Wins</h3>
               <div className="h-px bg-slate-200 dark:bg-graphite-border w-full"></div>
            </div>

            <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm min-h-[300px]">
               {stats.recentMilestones.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50 py-20">
                     <div className="text-5xl mb-4">🌱</div>
                     <p className="text-sm font-bold text-slate-400 dark:text-graphite-text-muted">No milestones yet.</p>
                     <p className="text-xs text-slate-400 dark:text-graphite-text-sub mt-1 max-w-[200px]">Complete a quiz to plant your first flag on the timeline.</p>
                  </div>
               ) : (
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-graphite-border">
                     {stats.recentMilestones.map((m, idx) => (
                        <div key={idx} className="relative pl-12 group">
                           {/* Timeline Dot */}
                           <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white dark:border-graphite-surface flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-sm
                              ${m.score >= 80 ? 'bg-emerald-500' : m.score >= 60 ? 'bg-amber-500' : 'bg-indigo-500'}
                           `}>
                              <span className="text-white text-[10px] font-black">{m.score}</span>
                           </div>
                           
                           {/* Content */}
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">
                                 {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </p>
                              <h5 className="font-bold text-slate-800 dark:text-graphite-text-main text-sm leading-snug line-clamp-2 mb-1" title={m.topicName}>
                                 {m.topicName}
                              </h5>
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                m.score === 100 ? 'bg-emerald-100 text-emerald-700' : 
                                m.score >= 80 ? 'bg-indigo-50 text-indigo-700' : 
                                'bg-slate-100 text-slate-600'
                              }`}>
                                 {m.score === 100 ? 'Perfect Score 🏆' : m.score >= 80 ? 'Mastery Achieved' : 'Practice Session'}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            
            {/* Encouragement Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-graphite-secondary dark:to-graphite-surface p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden border border-indigo-500/30 dark:border-graphite-border">
               <div className="relative z-10">
                  <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                    <span className="text-xl">🚀</span> Keep it up!
                  </h4>
                  <p className="text-sm font-medium text-indigo-100 dark:text-graphite-text-sub leading-relaxed opacity-90">
                     Consistent small steps lead to massive results. You're building a habit that will pay off.
                  </p>
               </div>
               <div className="absolute right-0 top-0 p-6 opacity-10 transform translate-x-4 -translate-y-4">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default PerformanceAnalytics;
