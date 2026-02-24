
import React, { useMemo } from 'react';
import { Subject, StudySession, TopicStatus } from '../types';

interface ProgressInsightsProps {
  subjects: Subject[];
  sessions: StudySession[];
}

const ProgressInsights: React.FC<ProgressInsightsProps> = ({ subjects, sessions }) => {
  
  const insights = useMemo(() => {
    const list: { text: string; type: 'success' | 'warning' | 'info' }[] = [];

    // 1. Activity Check
    const lastSession = sessions.length > 0 ? sessions[0] : null;
    const now = Date.now();
    const daysSinceLast = lastSession ? Math.floor((now - lastSession.lastUpdated) / (1000 * 60 * 60 * 24)) : 999;

    if (daysSinceLast === 0) {
        list.push({ text: "Great consistency! You've been active today.", type: 'success' });
    } else if (daysSinceLast > 5) {
        list.push({ text: `It's been ${daysSinceLast} days since your last session. Time to jump back in!`, type: 'warning' });
    }

    // 2. Weakness Check
    let weakCount = 0;
    let weakTopicName = "";
    subjects.forEach(s => s.units.forEach(u => u.topics.forEach(t => {
        if (t.status === 'Needs Revision' || t.isHistoricalWeakness) {
            weakCount++;
            if (!weakTopicName) weakTopicName = t.name;
        }
    })));

    if (weakCount > 0) {
        list.push({ 
            text: `${weakCount} topic${weakCount > 1 ? 's' : ''} marked for revision. Start with "${weakTopicName}".`, 
            type: 'info' 
        });
    } else {
        list.push({ text: "No weak areas detected currently. Keep pushing forward!", type: 'success' });
    }

    // 3. Subject Progress Check (Simple)
    const startedSubjects = subjects.filter(s => 
        s.units.some(u => u.topics.some(t => t.status === 'Completed' || t.status === 'In Progress'))
    );
    
    if (startedSubjects.length === 0) {
        list.push({ text: "Start a subject to generate detailed learning insights.", type: 'info' });
    } else {
        list.push({ text: `You are actively making progress in ${startedSubjects.length} subject${startedSubjects.length > 1 ? 's' : ''}.`, type: 'success' });
    }

    return list.slice(0, 3); // Limit to 3 insights
  }, [subjects, sessions]);

  return (
    <div className="bg-white dark:bg-graphite-surface p-6 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm h-full flex flex-col justify-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Progress Insights
        </h3>
        <div className="space-y-3">
            {insights.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs font-bold leading-relaxed flex gap-3 items-start
                    ${insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                      insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400'}
                `}>
                    <div className="mt-0.5 shrink-0">
                        {insight.type === 'success' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        {insight.type === 'warning' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        {insight.type === 'info' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    {insight.text}
                </div>
            ))}
        </div>
    </div>
  );
};

export default ProgressInsights;
