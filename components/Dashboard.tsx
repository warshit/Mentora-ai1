import React, { useMemo } from 'react';
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
  
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let practiced = 0;
    let highPriorityRemaining = 0;
    let needsRevision = 0;
    let historicalWeak = 0;
    let modulesMastered = 0;
    
    try {
      subjects.forEach(s => {
        s.units.forEach(u => {
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
        });
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        percent: 0,
        total: 0,
        completed: 0,
        highPriorityRemaining: 0,
        readinessScore: 0,
        needsRevision: 0,
        historicalWeak: 0,
        modulesMastered: 0
      };
    }
    
    const hasActivity = completed > 0 || inProgress > 0 || practiced > 0 || needsRevision > 0;
    let readinessScore = 0;

    if (hasActivity && total > 0) {
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
  }, [subjects]);

  const isUpskill = category === LearningCategory.UPSKILL;

  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-graphite-surface p-12 rounded-[2.5rem] border border-slate-200 dark:border-graphite-border text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-graphite-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400 dark:text-graphite-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-3">
            No curriculum loaded
          </h3>
          <p className="text-slate-600 dark:text-graphite-text-muted mb-6">
            Import your syllabus or select a semester to get started with your learning journey.
          </p>
          <button 
            onClick={onImportSyllabus}
            className="px-6 py-3 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-graphite-text-main transition-colors"
          >
            Import Syllabus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-white dark:bg-graphite-surface p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-graphite-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3.333a1 1 0 000 1.84l7 3.333a1 1 0 00.788 0l7-3.333a1 1 0 000-1.84l-7-3.333zM3 10.833l6.594 3.14a1 1 0 00.812 0L17 10.833V13.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-2.146l-2.781 1.324a1 1 0 01-.812 0L3 10.833z" />
              </svg>
              {isUpskill ? 'Career Blueprint' : 'Academic Roadmap'}
            </span>
            <span className="text-slate-300 dark:text-graphite-text-muted">/</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">Active Curriculum</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-graphite-text-main tracking-tight leading-tight">
            AI Learning Companion
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
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-white transition-colors dark:bg-graphite-secondary dark:text-graphite-text-main">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Syllabus Scan
          </button>
          
          {hasSyllabus && (
            <button 
                onClick={onGeneratePlan}
                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap dark:bg-graphite-action dark:text-graphite-base dark:hover:bg-white"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Generate Schedule
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-graphite-text-muted">Readiness Score</h3>
            <div className="text-2xl font-bold text-indigo-600 dark:text-graphite-action">
              {stats.readinessScore}%
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-graphite-secondary rounded-full h-2">
            <div 
              className="bg-indigo-600 dark:bg-graphite-action h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.readinessScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-graphite-text-muted">Modules Mastered</h3>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.modulesMastered}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-graphite-text-muted">
            Complete understanding achieved
          </p>
        </div>

        <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-graphite-text-muted">Critical Tasks</h3>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.highPriorityRemaining}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-graphite-text-muted">
            High priority items remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const subjectStats = {
            total: subject.units.reduce((acc, unit) => acc + unit.topics.length, 0),
            completed: subject.units.reduce((acc, unit) => 
              acc + unit.topics.filter(t => t.status === 'Completed').length, 0
            )
          };
          const completionPercent = subjectStats.total > 0 ? 
            Math.round((subjectStats.completed / subjectStats.total) * 100) : 0;

          return (
            <div
              key={subject.id}
              className="bg-white dark:bg-graphite-surface rounded-2xl border border-slate-200 dark:border-graphite-border hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Subject Code Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-wider mb-2">
                  {subject.code}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main leading-tight mb-4">
                  {subject.name}
                </h3>
                
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-graphite-text-muted uppercase tracking-wider">
                      Overall Progress
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main">
                        {completionPercent}%
                      </span>
                      <span className="text-xs text-slate-500 dark:text-graphite-text-muted ml-2">
                        {subjectStats.completed}/{subjectStats.total} Topics
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-graphite-secondary rounded-full h-1.5 mb-4">
                    <div 
                      className="bg-indigo-600 dark:bg-graphite-action h-1.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${completionPercent}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Modules Info */}
                <div className="flex items-center justify-between text-sm mb-6">
                  <span className="text-slate-600 dark:text-graphite-text-muted">
                    {subject.units.length} Modules
                  </span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => onSelectSubject(subject.id)}
                  className="w-full bg-indigo-600 dark:bg-graphite-action hover:bg-indigo-700 dark:hover:bg-graphite-text-main text-white dark:text-graphite-base font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span className="text-sm uppercase tracking-wider">OPEN</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;