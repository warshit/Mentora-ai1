
import React, { useState } from 'react';
import { Subject, Topic, TopicStatus, LearningCategory, Unit } from '../types';

interface SubjectPageProps {
  subject: Subject;
  onSelectTopic: (subject: Subject, topic: Topic) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onToggleRevision?: (topicId: string) => void; // New prop
  onStartQuiz: (subject: Subject, unit: Unit, topic?: Topic) => void;
  category: LearningCategory;
  onBack: () => void;
}

const SubjectPage: React.FC<SubjectPageProps> = ({ subject, onSelectTopic, onUpdateStatus, onToggleRevision, onStartQuiz, category, onBack }) => {
  const isUpskill = category === LearningCategory.UPSKILL;
  const [expandedUnit, setExpandedUnit] = useState<string | null>(subject.units[0]?.id || null);

  const toggleUnit = (unitId: string) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
  };

  const getPriorityBadge = (p: string) => {
    switch(p) {
      case 'High': return 'bg-rose-50 dark:bg-graphite-secondary text-rose-700 dark:text-graphite-text-main border-rose-100 dark:border-graphite-border';
      case 'Medium': return 'bg-amber-50 dark:bg-graphite-secondary text-amber-700 dark:text-graphite-text-sub border-amber-100 dark:border-graphite-border';
      case 'Low': return 'bg-emerald-50 dark:bg-graphite-secondary text-emerald-700 dark:text-graphite-text-muted border-emerald-100 dark:border-graphite-border';
      default: return 'bg-slate-50 dark:bg-graphite-secondary text-slate-600 dark:text-graphite-text-muted';
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

  const getTopicStatusColor = (status: TopicStatus) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500 dark:bg-graphite-text-main'; 
      case 'Practiced': return 'bg-amber-500 dark:bg-graphite-text-sub'; 
      case 'In Progress': return 'bg-indigo-500 dark:bg-graphite-text-sub'; 
      case 'Needs Revision': return 'bg-rose-500 dark:bg-graphite-text-muted'; 
      default: return 'bg-slate-200 dark:bg-graphite-border';
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

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back Navigation */}
      <div className="mb-6">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main transition-colors group"
        >
            <div className="p-1 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-graphite-secondary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </div>
            Back to Dashboard
        </button>
      </div>

      {/* Subject Header */}
      <div className={`rounded-[2.5rem] p-10 text-white dark:text-graphite-text-main shadow-2xl mb-10 relative overflow-hidden bg-indigo-600 dark:bg-graphite-surface border border-indigo-700 dark:border-graphite-border`}>
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <svg className="w-64 h-64 text-white dark:text-graphite-text-main" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-white/20 dark:bg-graphite-secondary backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20 dark:border-graphite-border text-white dark:text-graphite-text-sub">{subject.semester === 'UPSKILL' ? 'Skill Track' : `Semester ${subject.semester || 'V'}`}</span>
             <span className="px-3 py-1 bg-white/20 dark:bg-graphite-secondary backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20 dark:border-graphite-border text-white dark:text-graphite-text-sub">{subject.code}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white dark:text-graphite-text-main">{subject.name}</h1>
          <p className="text-indigo-100 dark:text-graphite-text-sub font-medium max-w-2xl text-lg">
            Explore the complete syllabus structure. Select a topic to begin an interactive learning session focused on exam preparation and conceptual mastery.
          </p>
        </div>
      </div>

      {/* Syllabus Modules */}
      <div className="space-y-6">
        {subject.units.map((unit) => {
          const completedCount = unit.topics.filter(t => t.status === 'Completed').length;
          const totalCount = unit.topics.length;
          
          const weightedScore = unit.topics.reduce((acc, t) => acc + getTopicProgress(t.status), 0);
          const progressPercent = totalCount > 0 ? Math.round(weightedScore / totalCount) : 0;

          return (
            <div key={unit.id} className="bg-white dark:bg-graphite-surface rounded-3xl border border-slate-200 dark:border-graphite-border shadow-sm overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-graphite-text-muted">
              <div className="w-full flex items-center justify-between p-6 bg-white dark:bg-graphite-surface border-b border-slate-100 dark:border-graphite-border">
                <button 
                    onClick={() => toggleUnit(unit.id)}
                    className="flex-1 flex items-center gap-4 text-left mr-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner flex-shrink-0 bg-slate-50 dark:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main`}>
                    {unit.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-graphite-action transition-colors truncate">{unit.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 bg-indigo-500 dark:bg-graphite-text-sub`} 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-graphite-text-muted font-bold uppercase tracking-wider">{completedCount}/{totalCount} Topics • {progressPercent}% Done</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartQuiz(subject, unit);
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md flex items-center gap-2
                      bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main hover:bg-indigo-100 dark:hover:bg-graphite-border`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      Module Quiz
                    </button>
                    <button 
                      onClick={() => toggleUnit(unit.id)}
                      className={`transform transition-transform duration-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-graphite-secondary ${expandedUnit === unit.id ? 'rotate-180' : ''}`}
                    >
                      <svg className="w-6 h-6 text-slate-400 dark:text-graphite-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
              </div>
              
              {expandedUnit === unit.id && (
                <div className="p-4 bg-slate-50/50 dark:bg-graphite-base/50">
                  <div className="grid gap-3">
                    {unit.topics.map((topic) => {
                      const topicProgress = getTopicProgress(topic.status);
                      const isFlagged = topic.status === 'Needs Revision' || topic.isHistoricalWeakness;
                      
                      return (
                        <div 
                          key={topic.id}
                          className="group flex items-center justify-between p-4 bg-white dark:bg-graphite-surface rounded-2xl border border-slate-200 dark:border-graphite-border hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-all"
                        >
                            <div 
                              className="flex items-center gap-4 flex-1 cursor-pointer"
                              onClick={() => onSelectTopic(subject, topic)}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getTopicStatusColor(topic.status)}`}></div>
                              <div className="flex-1">
                                <h4 className={`text-sm font-bold transition-colors group-hover:text-indigo-600 dark:group-hover:text-graphite-action text-slate-700 dark:text-graphite-text-main`}>{topic.name}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getPriorityBadge(topic.priority)}`}>{topic.priority}</span>
                                  <span className="text-[9px] font-medium text-slate-400 dark:text-graphite-text-muted">{topic.status}</span>
                                  
                                  {/* UNIFIED TOPIC PROGRESS BAR */}
                                  <div className="flex-1 max-w-[80px] h-1 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                                     <div className={`h-full ${getStatusColorClass(topic.status)}`} style={{width: `${topicProgress}%`}}></div>
                                  </div>

                                  {topic.isHistoricalWeakness && <span className="text-[9px] font-bold text-rose-500 dark:text-graphite-text-sub flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Focus Area
                                  </span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* QUICK REVISION TOGGLE */}
                              {onToggleRevision && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleRevision(topic.id); }}
                                    className={`p-2 rounded-lg transition-colors ${isFlagged ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-300 dark:text-graphite-text-muted hover:text-rose-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-graphite-secondary'}`}
                                    title={isFlagged ? "Unmark Revision" : "Mark for Revision"}
                                >
                                    <svg className="w-5 h-5" fill={isFlagged ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                </button>
                              )}

                              <button
                                onClick={() => onStartQuiz(subject, unit, topic)}
                                className="text-[10px] font-bold text-slate-500 dark:text-graphite-text-muted hover:text-indigo-600 dark:hover:text-graphite-text-main bg-slate-100 dark:bg-graphite-secondary hover:bg-slate-200 dark:hover:bg-graphite-border px-3 py-1.5 rounded-lg transition-colors border border-transparent dark:border-graphite-border"
                              >
                                Start Quiz
                              </button>
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newStatus = topic.status === 'Completed' ? 'Not Started' : 'Completed';
                                    onUpdateStatus(topic.id, newStatus);
                                  }}
                                  className={`p-2 rounded-lg transition-colors z-10 ${topic.status === 'Completed' ? 'text-emerald-600 dark:text-graphite-action hover:bg-emerald-50 dark:hover:bg-graphite-secondary' : 'text-slate-300 dark:text-graphite-text-muted hover:text-slate-500 dark:hover:text-graphite-text-main'}`}
                                  title={topic.status === 'Completed' ? "Mark as Not Started" : "Mark as Completed"}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                              </button>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectPage;
