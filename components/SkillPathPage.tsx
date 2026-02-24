
import React from 'react';
import { Subject, Topic, TopicStatus, Unit } from '../types';

interface SkillPathPageProps {
  subject: Subject;
  onSelectTopic: (subject: Subject, topic: Topic) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onStartQuiz: (subject: Subject, unit: Unit, topic?: Topic) => void;
  onBack: () => void;
}

const SkillPathPage: React.FC<SkillPathPageProps> = ({ subject, onSelectTopic, onUpdateStatus, onStartQuiz, onBack }) => {
  
  const getStatusIcon = (status: TopicStatus) => {
    switch(status) {
      case 'Completed': 
        return <div className="w-6 h-6 rounded-full bg-emerald-500 dark:bg-graphite-text-main flex items-center justify-center text-white dark:text-graphite-base"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>;
      case 'Practiced':
        return <div className="w-6 h-6 rounded-full bg-amber-500 dark:bg-graphite-text-sub flex items-center justify-center text-white dark:text-graphite-base"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>;
      case 'In Progress':
        return <div className="w-6 h-6 rounded-full bg-indigo-500 dark:bg-graphite-text-sub flex items-center justify-center text-white dark:text-graphite-base"><div className="w-2 h-2 bg-white dark:bg-graphite-base rounded-full animate-pulse"></div></div>;
      case 'Needs Revision':
        return <div className="w-6 h-6 rounded-full bg-rose-500 dark:bg-graphite-text-muted flex items-center justify-center text-white dark:text-graphite-base"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01" /></svg></div>;
      default:
        return <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-graphite-secondary border-2 border-slate-300 dark:border-graphite-border"></div>;
    }
  };

  const getStatusLabel = (status: TopicStatus) => {
    switch (status) {
      case 'In Progress': return 'Learning';
      case 'Practiced': return 'Practiced';
      case 'Completed': return 'Completed';
      case 'Needs Revision': return 'Revise';
      default: return 'Not Started';
    }
  };

  const getStatusColor = (status: TopicStatus) => {
    switch(status) {
      case 'Completed': return 'text-emerald-600 dark:text-emerald-400';
      case 'Practiced': return 'text-amber-600 dark:text-amber-400';
      case 'In Progress': return 'text-indigo-600 dark:text-indigo-400';
      case 'Needs Revision': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-slate-500 dark:text-graphite-text-muted';
    }
  };

  const getTopicProgress = (status: TopicStatus): number => {
    switch (status) {
      case 'Completed': return 100;
      case 'Practiced': return 70;
      case 'Needs Revision': return 80;
      case 'In Progress': return 30;
      default: return 0;
    }
  };

  const getStatusColorClass = (status: TopicStatus) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-500';
      case 'Practiced': return 'bg-amber-500';
      case 'In Progress': return 'bg-indigo-500';
      case 'Needs Revision': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  // Cycle: Not Started -> Learning -> Practiced -> Completed -> Not Started
  const cycleStatus = (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    let next: TopicStatus = 'Not Started';
    if (topic.status === 'Not Started') next = 'In Progress';
    else if (topic.status === 'In Progress') next = 'Practiced';
    else if (topic.status === 'Practiced') next = 'Completed';
    else if (topic.status === 'Completed') next = 'Not Started'; 
    else if (topic.status === 'Needs Revision') next = 'Practiced';
    
    onUpdateStatus(topic.id, next);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-graphite-base font-sans">
      
      {/* Skill Hero Section */}
      <div className="bg-white dark:bg-graphite-surface border-b border-slate-200 dark:border-graphite-border px-10 py-12 shrink-0">
         <div className="max-w-5xl mx-auto">
            {/* Back Navigation */}
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main mb-6 transition-colors group"
            >
                <div className="p-1 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-graphite-secondary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </div>
                Back to Dashboard
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-50 dark:bg-graphite-secondary text-amber-700 dark:text-graphite-text-sub border border-amber-100 dark:border-graphite-border rounded-lg text-[10px] font-black uppercase tracking-widest">
                Career Track
              </span>
              <span className="text-slate-300 dark:text-graphite-text-muted">/</span>
              <span className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">{subject.code}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-graphite-text-main tracking-tight mb-4">{subject.name}</h1>
                <p className="text-slate-500 dark:text-graphite-text-sub font-medium max-w-2xl leading-relaxed">
                  A structured roadmap designed to take you from foundational concepts to advanced application. 
                  Master the skills top employers are looking for.
                </p>
              </div>
            </div>
         </div>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-10">
          
          <div className="relative border-l-2 border-slate-200 dark:border-graphite-border ml-3 space-y-12">
            {subject.units.map((unit, unitIdx) => (
              <div key={unit.id} className="relative pl-12 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${unitIdx * 100}ms` }}>
                {/* Phase Marker */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-graphite-base border-4 border-slate-300 dark:border-graphite-text-muted"></div>
                
                <div className="mb-6">
                  <span className="text-[10px] font-black text-slate-400 dark:text-graphite-text-main uppercase tracking-[0.2em] block mb-1">
                    Phase 0{unit.number}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main">{unit.title}</h2>
                </div>

                {/* Steps (Topics) */}
                <div className="space-y-4">
                  {unit.topics.map((topic) => {
                    const topicProgress = getTopicProgress(topic.status);
                    return (
                      <div 
                        key={topic.id}
                        className={`group relative bg-white dark:bg-graphite-surface rounded-2xl p-5 border transition-all duration-200 hover:border-indigo-400 dark:hover:border-graphite-text-sub cursor-pointer flex items-center justify-between
                          ${topic.status === 'Completed' 
                            ? 'border-emerald-200 dark:border-graphite-text-sub shadow-sm' 
                            : topic.status === 'Practiced'
                            ? 'border-amber-200 dark:border-amber-900/50 shadow-sm'
                            : 'border-slate-200 dark:border-graphite-border'}
                        `}
                        onClick={() => onSelectTopic(subject, topic)}
                      >
                        <div className="flex items-center gap-5 flex-1">
                           <button onClick={(e) => cycleStatus(e, topic)} className="transition-transform active:scale-95 focus:outline-none">
                              {getStatusIcon(topic.status)}
                           </button>
                           <div className="flex-1">
                             <h3 className={`text-base font-bold transition-colors text-slate-800 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-graphite-text-sub`}>
                               {topic.name}
                             </h3>
                             <div className="flex items-center gap-3 mt-1.5">
                               <span className={`text-[10px] font-bold ${getStatusColor(topic.status)} uppercase tracking-wide`}>
                                 {getStatusLabel(topic.status)}
                               </span>
                               
                               {/* UNIFIED PROGRESS BAR */}
                               <div className="flex-1 max-w-[80px] h-1 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                                  <div className={`h-full ${getStatusColorClass(topic.status)}`} style={{width: `${topicProgress}%`}}></div>
                               </div>

                               {topic.isHistoricalWeakness && (
                                 <span className="px-2 py-0.5 bg-rose-50 dark:bg-graphite-secondary text-rose-600 dark:text-graphite-text-main text-[9px] font-bold uppercase tracking-widest rounded-md">
                                   Priority
                                 </span>
                               )}
                             </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               onStartQuiz(subject, unit, topic);
                             }}
                             className="px-4 py-2 bg-slate-50 dark:bg-graphite-base hover:bg-slate-100 dark:hover:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-slate-200 dark:border-graphite-border"
                           >
                             Practice
                           </button>
                           <button
                              onClick={(e) => cycleStatus(e, topic)}
                              className="p-2 text-slate-400 dark:text-graphite-text-muted hover:text-emerald-600 dark:hover:text-graphite-text-main transition-colors"
                              title="Cycle Status"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-400 dark:text-graphite-text-muted text-sm font-medium">End of Roadmap</p>
            <div className="w-2 h-2 bg-slate-200 dark:bg-graphite-border rounded-full mx-auto mt-4"></div>
            <div className="w-2 h-2 bg-slate-200 dark:bg-graphite-border rounded-full mx-auto mt-2"></div>
            <div className="w-2 h-2 bg-slate-200 dark:bg-graphite-border rounded-full mx-auto mt-2"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SkillPathPage;
