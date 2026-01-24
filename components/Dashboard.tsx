
import React from 'react';
import { Subject, Topic, TopicStatus, LearningCategory } from '../types';

interface DashboardProps {
  subjects: Subject[];
  onSelectTopic: (subject: Subject, topic: Topic) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onImportSyllabus: () => void;
  onGeneratePlan: () => void;
  category: LearningCategory;
  onSelectSubject: (subjectId: string) => void;
  hasSyllabus: boolean;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subjects, 
  onSelectTopic, 
  onUpdateStatus, 
  onImportSyllabus, 
  onGeneratePlan, 
  category, 
  onSelectSubject, 
  hasSyllabus,
  onNavigate
}) => {
  
  const getTopicWeight = (status: TopicStatus) => {
    switch (status) {
      case 'Completed': return 100;
      case 'Practiced': return 70;
      case 'Needs Revision': return 80;
      case 'In Progress': return 30;
      default: return 0;
    }
  };

  const calculateStats = () => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let practiced = 0;
    let highPriorityRemaining = 0;
    let needsRevision = 0;
    let historicalWeak = 0;
    let modulesMastered = 0;
    
    subjects.forEach(s => s.units.forEach(u => {
      // Calculate Module Mastery (All topics completed)
      if (u.topics.length > 0 && u.topics.every(t => t.status === 'Completed')) {
        modulesMastered++;
      }

      u.topics.forEach(t => {
        total++;
        if (t.status === 'Completed') completed++;
        if (t.status === 'In Progress') inProgress++;
        if (t.status === 'Practiced') practiced++;
        if (t.status === 'Needs Revision') needsRevision++;
        
        if (t.priority === 'High' && t.status !== 'Completed') highPriorityRemaining++;
        if (t.isHistoricalWeakness) historicalWeak++;
      });
    }));
    
    // BASELINE CHECK: If no activity, Readiness is strictly 0%
    const hasActivity = completed > 0 || inProgress > 0 || practiced > 0 || needsRevision > 0;
    
    let readinessScore = 0;

    if (hasActivity && total > 0) {
        // Weighted Calculation
        const rawScore = (
            (completed * 1.0) + 
            (practiced * 0.7) + 
            (needsRevision * 0.5) + 
            (inProgress * 0.2)
        );
        readinessScore = Math.round((rawScore / total) * 100);
        readinessScore = Math.min(100, Math.max(0, readinessScore));
    }
    
    return { 
      percent: total ? Math.round((completed / total) * 100) : 0,
      total,
      completed,
      highPriorityRemaining,
      readinessScore,
      needsRevision,
      historicalWeak,
      modulesMastered
    };
  };

  const stats = calculateStats();
  const isUpskill = category === LearningCategory.UPSKILL;

  // Circular Graph Params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.readinessScore / 100) * circumference;

  // Bead Position Calculation (Start at -90deg / 12 o'clock)
  const angle = (stats.readinessScore / 100) * 2 * Math.PI - (Math.PI / 2);
  const beadX = 96 + radius * Math.cos(angle);
  const beadY = 96 + radius * Math.sin(angle);

  const getStatusMessage = (score: number) => {
    if (score === 0) return "Your journey has begun";
    if (score < 30) return "Building momentum";
    if (score < 60) return "Making solid progress";
    if (score < 90) return "Almost at the top";
    return "Ready for excellence";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-white dark:bg-graphite-surface p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-graphite-border`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827a1 1 0 00-.788 0l-7 3.333a1 1 0 000 1.84l7 3.333a1 1 0 00.788 0l7-3.333a1 1 0 000-1.84l-7-3.333zM3 10.833l6.594 3.14a1 1 0 00.812 0L17 10.833V13.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-2.146l-2.781 1.324a1 1 0 01-.812 0L3 10.833z" /></svg>
              {isUpskill ? 'Career Blueprint' : 'Academic Roadmap'}
            </span>
            <span className="text-slate-300 dark:text-graphite-text-muted">/</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">Active Curriculum</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-graphite-text-main tracking-tight leading-tight">
            A Rule-Based & Analytics-Driven AI Learning Companion
          </h2>
          <p className="text-slate-500 dark:text-graphite-text-sub mt-2 font-medium text-sm">
            {isUpskill ? 'Refining your industry skill graph and interview readiness.' : 'Navigating your university syllabus with exam-oriented precision.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onImportSyllabus}
            className="group flex-1 md:flex-none px-6 py-3.5 bg-transparent border border-indigo-600 text-indigo-600 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-sm whitespace-nowrap dark:border-graphite-action dark:text-graphite-text-main dark:hover:bg-graphite-secondary"
          >
            <div className={`p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-white transition-colors dark:bg-graphite-secondary dark:text-graphite-text-main`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            Syllabus Scan
          </button>
          
          {hasSyllabus && (
            <button 
                onClick={onGeneratePlan}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Generate Schedule
            </button>
          )}
        </div>
      </div>

      {/* Analytics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* 1. READINESS SCORE (Updated Layout) */}
        <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2.5rem] border shadow-sm border-slate-200 dark:border-graphite-border col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
           
           {/* Left: Circular Chart */}
           <div className="relative w-48 h-48 shrink-0">
              <svg className="w-full h-full">
                 {/* Track */}
                 <circle
                   cx="96"
                   cy="96"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="16"
                   fill="transparent"
                   className="text-slate-100 dark:text-graphite-border"
                 />
                 {/* Progress Ring */}
                 <circle
                   cx="96"
                   cy="96"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="16"
                   fill="transparent"
                   strokeDasharray={circumference}
                   strokeDashoffset={strokeDashoffset}
                   strokeLinecap="round"
                   className="text-indigo-600 dark:text-graphite-action transition-all duration-1000 ease-out origin-center -rotate-90"
                 />
                 {/* Indicator Bead */}
                 {stats.readinessScore > 0 && (
                    <circle 
                        cx={beadX}
                        cy={beadY}
                        r="6"
                        className="fill-indigo-600 dark:fill-graphite-text-main transition-all duration-1000 ease-out"
                    />
                 )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-black text-slate-900 dark:text-graphite-text-main">
                    {stats.readinessScore}%
                 </span>
                 <span className="text-[10px] font-black text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest mt-1">
                    Readiness
                 </span>
              </div>
           </div>

           {/* Right: Info & Stats Grid */}
           <div className="flex-1 w-full flex flex-col gap-6">
              
              {/* CURRENT STATUS CARD (Updated with Graph) */}
              <div className="bg-white dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-xl p-4 shadow-sm flex flex-col justify-between text-left h-full min-h-[140px] relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-graphite-text-muted mb-2">Current Status</h4>
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-graphite-action"></div>
                        <p className="text-base font-semibold text-gray-900 dark:text-graphite-text-main leading-none">
                          {getStatusMessage(stats.readinessScore)}
                        </p>
                    </div>
                  </div>
                  
                  {/* Graph */}
                  <div className="mt-4 h-12 w-full relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" className="text-indigo-600 dark:text-graphite-text-main" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="currentColor" className="text-indigo-600 dark:text-graphite-text-main" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Subtle Grid Line */}
                      <line x1="0" y1="35" x2="100" y2="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-slate-200 dark:text-graphite-border opacity-50" />

                      {/* Area Fill */}
                      <path 
                        d="M0 35 C 40 35, 60 20, 100 5 V 40 H 0 Z" 
                        fill="url(#momentumGradient)" 
                        stroke="none"
                      />
                      
                      {/* Trend Line */}
                      <path 
                        d="M0 35 C 40 35, 60 20, 100 5" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                        className="text-indigo-500 dark:text-graphite-text-main transition-all duration-1000 ease-out" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      
                      {/* End Point Marker */}
                      <circle cx="100" cy="5" r="3" className="fill-indigo-600 dark:fill-graphite-text-main stroke-white dark:stroke-graphite-base stroke-2" />
                      <circle cx="100" cy="5" r="6" className="fill-indigo-600 dark:fill-graphite-text-main opacity-20 animate-pulse" />
                    </svg>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-indigo-50 dark:bg-graphite-secondary p-4 rounded-2xl flex flex-col justify-center">
                    <p className="text-2xl font-black text-indigo-700 dark:text-graphite-text-main">{stats.modulesMastered}</p>
                    <p className="text-[9px] font-black text-indigo-400 dark:text-graphite-text-sub uppercase tracking-wider mt-1">Modules Mastered</p>
                 </div>
                 <div className="bg-indigo-50 dark:bg-graphite-secondary p-4 rounded-2xl flex flex-col justify-center">
                    <p className="text-2xl font-black text-indigo-700 dark:text-graphite-text-main">{stats.highPriorityRemaining}</p>
                    <p className="text-[9px] font-black text-indigo-400 dark:text-graphite-text-sub uppercase tracking-wider mt-1">Critical Tasks</p>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. HISTORICAL WEAKNESS */}
        <div className={`bg-white dark:bg-graphite-surface p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between group transition-all duration-500 border-slate-200 dark:border-graphite-border col-span-1`}>
          <div>
            <p className="text-[11px] font-black text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest mb-4">Historically Weak</p>
            <h4 className={`text-5xl font-black transition-colors text-slate-900 dark:text-graphite-text-main`}>{stats.historicalWeak}</h4>
          </div>
          <div className="mt-4">
             <p className="text-xs text-slate-500 dark:text-graphite-text-sub font-medium leading-relaxed">Areas flagged for repetitive cognitive reinforcement.</p>
             <div className="w-full h-1.5 bg-slate-100 dark:bg-graphite-secondary rounded-full mt-4 overflow-hidden">
                <div className={`h-full transition-all duration-1000 bg-rose-500 dark:bg-graphite-text-muted`} style={{width: `${stats.total > 0 ? (stats.historicalWeak / stats.total) * 100 : 0}%`}}></div>
             </div>
          </div>
        </div>

        {/* 3. PRIORITY STATS */}
        <div className={`p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between border transition-all duration-700 bg-indigo-50 dark:bg-graphite-secondary border-indigo-100 dark:border-graphite-border col-span-1`}>
          <div>
            <p className="text-[11px] font-black text-indigo-400 dark:text-graphite-text-muted uppercase tracking-widest mb-4">{isUpskill ? 'Interview Priority' : 'Exam Weightage'}</p>
            <div className="flex items-baseline gap-2">
              <h4 className={`text-5xl font-black text-indigo-900 dark:text-graphite-text-main`}>{stats.highPriorityRemaining}</h4>
              <span className={`font-black text-xs uppercase tracking-widest text-indigo-400 dark:text-graphite-text-muted`}>Critical</span>
            </div>
          </div>
          <p className="text-[10px] text-indigo-400 dark:text-graphite-text-muted font-bold uppercase tracking-widest mt-6">Priority Level: MAXIMUM</p>
        </div>
      </div>

      {/* Course Library */}
      <div className="space-y-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight flex items-center gap-3">
          <div className={`w-2 h-8 rounded-full transition-all duration-700 bg-indigo-600 dark:bg-graphite-action`}></div>
          {isUpskill ? 'Skill Tracks' : 'Academic Library'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            // Calculate per-subject progress using weighted average
            const subTotal = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
            
            const subScore = subject.units.reduce((acc, u) => {
                return acc + u.topics.reduce((tAcc, t) => tAcc + getTopicWeight(t.status), 0);
            }, 0);
            
            // Max possible score is 100 * total topics
            const subProgress = subTotal ? Math.round(subScore / subTotal) : 0;
            
            const subCompleted = subject.units.reduce((acc, u) => acc + u.topics.filter(t => t.status === 'Completed').length, 0);
            const subWeakness = subject.units.reduce((acc, u) => acc + u.topics.filter(t => t.isHistoricalWeakness).length, 0);

            return (
              <div key={subject.id} className={`group relative bg-white dark:bg-graphite-surface rounded-[2.5rem] border p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-slate-200 dark:border-graphite-border`}>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg className="w-24 h-24 text-slate-900 dark:text-graphite-text-main" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                 </div>
                 
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border bg-slate-50 dark:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main border-slate-200 dark:border-graphite-border`}>
                                {subject.code}
                            </span>
                            {subWeakness > 0 && (
                                <span className="text-[9px] font-bold text-rose-600 dark:text-graphite-text-sub flex items-center gap-1 bg-rose-50 dark:bg-graphite-secondary px-2 py-1 rounded-lg">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  {subWeakness} Focus Areas
                                </span>
                            )}
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-graphite-text-main mb-2 leading-tight h-auto md:h-14 md:line-clamp-2" title={subject.name}>
                            {subject.name}
                        </h3>

                        <div className="mt-6 mb-2 flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-wider">Overall Progress</span>
                            <div className="text-right">
                               <span className={`text-xl font-black text-slate-900 dark:text-graphite-text-main`}>{subProgress}%</span>
                               <span className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted ml-2">{subCompleted}/{subTotal} Topics</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-graphite-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 bg-indigo-600 dark:bg-graphite-action`} style={{width: `${subProgress}%`}}></div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-graphite-border flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-graphite-text-muted">{subject.units.length} Modules</span>
                        <button 
                            onClick={() => onSelectSubject(subject.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2
                            bg-indigo-600 hover:bg-indigo-700 dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white`}
                        >
                            Open
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
