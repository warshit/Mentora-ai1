
import React, { useState } from 'react';
import { Subject, SkillAnalysisResult, TopicStatus } from '../types';
import SkillGapAnalyzer from './SkillGapAnalyzer';

interface UpskillDashboardProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
}

const UpskillDashboard: React.FC<UpskillDashboardProps> = ({ subjects, onSelectSubject }) => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleApplyPath = (path: SkillAnalysisResult) => {
    // In a real app, this would persist the path. For now, we simulate success.
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTopicWeight = (status: TopicStatus) => {
    switch (status) {
      case 'Completed': return 100;
      case 'Practiced': return 70;
      case 'Needs Revision': return 80;
      case 'In Progress': return 30;
      default: return 0;
    }
  };

  // Helper to get theme based on Subject ID
  const getTheme = (id: string) => {
    // Graphite Dark Mode Overrides (Locked Palette)
    const dark = {
      gradient: 'dark:bg-none dark:bg-graphite-surface',
      text: 'dark:text-graphite-text-main',
      subtext: 'dark:text-graphite-text-sub',
      badge: 'dark:bg-graphite-secondary dark:text-graphite-text-main dark:border-graphite-border',
      button: 'dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white',
      progressTrack: 'dark:bg-graphite-secondary',
      progressFill: 'dark:bg-graphite-action',
      icon: 'dark:text-graphite-text-muted/10'
    };

    let base = { gradient: '', text: '', subtext: '', badge: '', button: '', progressTrack: '', progressFill: '', icon: '' };

    switch (id) {
      case 'skill-java-fs':
        base = {
          gradient: 'bg-gradient-to-br from-[#064E3B] to-[#065F46]',
          text: 'text-white',
          subtext: 'text-emerald-100',
          badge: 'bg-emerald-900/40 text-emerald-50 border-emerald-500/30',
          button: 'bg-white text-emerald-900 hover:bg-emerald-50',
          progressTrack: 'bg-emerald-900/50',
          progressFill: 'bg-emerald-400',
          icon: 'text-emerald-400/20'
        };
        break;
      case 'skill-ml':
      case 'skill-ds':
        base = {
          gradient: 'bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8]',
          text: 'text-white',
          subtext: 'text-blue-100',
          badge: 'bg-blue-900/40 text-blue-50 border-blue-500/30',
          button: 'bg-white text-blue-900 hover:bg-blue-50',
          progressTrack: 'bg-blue-900/50',
          progressFill: 'bg-blue-400',
          icon: 'text-blue-400/20'
        };
        break;
      case 'skill-web':
        base = {
          gradient: 'bg-gradient-to-br from-[#3F3F46] to-[#18181B]',
          text: 'text-white',
          subtext: 'text-zinc-300',
          badge: 'bg-zinc-700/50 text-zinc-100 border-zinc-500/30',
          button: 'bg-white text-zinc-900 hover:bg-zinc-100',
          progressTrack: 'bg-zinc-700/50',
          progressFill: 'bg-white',
          icon: 'text-zinc-500/20'
        };
        break;
      case 'skill-ai':
        base = {
          gradient: 'bg-gradient-to-br from-[#312E81] to-[#4C1D95]',
          text: 'text-white',
          subtext: 'text-indigo-100',
          badge: 'bg-indigo-900/40 text-indigo-50 border-indigo-500/30',
          button: 'bg-white text-indigo-900 hover:bg-indigo-50',
          progressTrack: 'bg-indigo-900/50',
          progressFill: 'bg-indigo-400',
          icon: 'text-indigo-400/20'
        };
        break;
      default:
        base = {
          gradient: 'bg-gradient-to-br from-slate-800 to-slate-900',
          text: 'text-white',
          subtext: 'text-slate-300',
          badge: 'bg-slate-700/50 text-slate-100 border-slate-500/30',
          button: 'bg-white text-slate-900 hover:bg-slate-100',
          progressTrack: 'bg-slate-700/50',
          progressFill: 'bg-white',
          icon: 'text-slate-500/20'
        };
        break;
    }

    return {
      gradient: `${base.gradient} ${dark.gradient}`,
      text: `${base.text} ${dark.text}`,
      subtext: `${base.subtext} ${dark.subtext}`,
      badge: `${base.badge} ${dark.badge}`,
      button: `${base.button} ${dark.button}`,
      progressTrack: `${base.progressTrack} ${dark.progressTrack}`,
      progressFill: `${base.progressFill} ${dark.progressFill}`,
      icon: `${base.icon} ${dark.icon}`
    };
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 font-sans relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 right-10 bg-emerald-500 dark:bg-graphite-action text-white dark:text-graphite-base px-6 py-3 rounded-2xl shadow-xl z-[60] flex items-center gap-3 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
         <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>
         <span className="text-xs font-black uppercase tracking-widest">Plan Activated</span>
      </div>

      <SkillGapAnalyzer 
        isOpen={showAnalyzer}
        onClose={() => setShowAnalyzer(false)}
        onApplyPath={handleApplyPath}
      />

      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-graphite-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-graphite-text-main mb-2 block">
            Professional Development
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-graphite-text-main tracking-tight leading-tight">
            Upskill Dashboard
          </h1>
          <p className="text-slate-500 dark:text-graphite-text-sub mt-2 text-lg font-medium max-w-2xl">
            Build industry-ready skills step by step. Select a specialized track to begin your journey toward mastery.
          </p>
        </div>
        <div className="flex gap-3">
             <button 
               onClick={() => setShowAnalyzer(true)}
               className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Find My Skill Gaps
             </button>
             <div className="px-5 py-2 bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border rounded-xl shadow-sm hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">Active Tracks</p>
                <p className="text-xl font-black text-slate-900 dark:text-graphite-text-main">{subjects.length}</p>
             </div>
        </div>
      </div>

      {/* DSA Highlight Card - REDIRECTS TO DSA VIEW NOW */}
      <div 
        className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] dark:from-graphite-surface dark:to-graphite-surface dark:bg-graphite-surface border border-transparent dark:border-graphite-border rounded-[2rem] p-10 text-white dark:text-graphite-text-main relative overflow-hidden shadow-2xl dark:shadow-sm group cursor-pointer hover:shadow-[0_20px_50px_-12px_rgba(49,46,129,0.5)] dark:hover:shadow-none transition-all duration-500 hover:-translate-y-1"
        onClick={() => onSelectSubject('dsa')}
      >
         <div className="absolute top-0 right-0 p-8 opacity-20 dark:opacity-10 transition-transform group-hover:scale-110 duration-700">
            <svg className="w-48 h-48 text-white dark:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-white/10 dark:bg-graphite-secondary backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20 dark:border-graphite-border text-indigo-100 dark:text-graphite-text-sub">LeetCode Style</span>
               <span className="px-3 py-1 bg-white/10 dark:bg-graphite-secondary backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20 dark:border-graphite-border text-indigo-100 dark:text-graphite-text-sub">Java</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-4 text-white dark:text-graphite-text-main">DSA Practice Hub</h2>
            <p className="text-indigo-100 dark:text-graphite-text-sub font-medium text-lg mb-8 leading-relaxed opacity-90">
               Master Data Structures & Algorithms with our interactive coding environment. Solve problems, run test cases, and get AI-powered hints instantly.
            </p>
            <button className="px-8 py-3 bg-white dark:bg-graphite-action text-[#1E1B4B] dark:text-graphite-base rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-white transition-colors shadow-lg flex items-center gap-2">
               Start Coding
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
         </div>
      </div>

      {/* Skill Path Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => {
          // Calculate Progress (Completed = 100%, Practiced = 70%, In Progress = 30%)
          const subTotal = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
          const completedCount = subject.units.reduce((acc, u) => acc + u.topics.filter(t => t.status === 'Completed').length, 0);
          
          const subScore = subject.units.reduce((acc, u) => {
             return acc + u.topics.reduce((tAcc, t) => tAcc + getTopicWeight(t.status), 0);
          }, 0);
          
          const subProgress = subTotal ? Math.round(subScore / subTotal) : 0;
          
          const theme = getTheme(subject.id);

          return (
            <div 
              key={subject.id} 
              className={`group flex flex-col ${theme.gradient} rounded-3xl border border-white/10 dark:border-graphite-border overflow-hidden hover:shadow-2xl dark:hover:shadow-lg dark:hover:border-graphite-text-muted transition-all duration-300 cursor-pointer h-full hover:-translate-y-2`}
              onClick={() => onSelectSubject(subject.id)}
            >
              {/* Card Banner Area (Kept for spacing/structure but transparent) */}
              <div className="h-32 bg-transparent relative overflow-hidden shrink-0">
                {/* Abstract Pattern */}
                <svg className={`absolute right-0 top-0 w-48 h-48 ${theme.icon} transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                </svg>
                <div className="absolute bottom-4 left-8">
                   <span className={`px-2 py-1 backdrop-blur-md text-[9px] font-black uppercase tracking-widest rounded-md border ${theme.badge}`}>
                     Career Track
                   </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-8 pt-2 flex-1 flex flex-col">
                <h3 className={`text-2xl font-extrabold ${theme.text} mb-2 leading-tight`}>
                  {subject.name}
                </h3>
                <p className={`text-sm ${theme.subtext} font-medium leading-relaxed mb-6 opacity-90`}>
                  Master the essential tools and concepts required for this role. Includes practical projects and interview preparation.
                </p>

                <div className="mt-auto space-y-5">
                   {/* Progress */}
                   <div>
                     <div className="flex justify-between items-end mb-2">
                       <span className={`text-[10px] font-bold ${theme.subtext} uppercase tracking-widest opacity-80`}>Proficiency</span>
                       <span className={`text-sm font-black ${theme.text}`}>{subProgress}% <span className="opacity-70 text-xs">({completedCount}/{subTotal} Topics)</span></span>
                     </div>
                     <div className={`w-full h-1.5 ${theme.progressTrack} rounded-full overflow-hidden`}>
                       <div className={`h-full ${theme.progressFill} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:shadow-none`} style={{ width: `${subProgress}%` }}></div>
                     </div>
                   </div>

                   {/* Action */}
                   <button className={`w-full py-3 rounded-xl ${theme.button} font-bold text-xs uppercase tracking-widest transition-all shadow-lg`}>
                     {subProgress > 0 ? 'Continue Learning' : 'Start Track'}
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpskillDashboard;
