
import React, { useState, useEffect } from 'react';
import { ScheduleConfig } from '../types';

interface ScheduleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ScheduleConfig) => void;
  hasSyllabus: boolean;
  semester: string;
}

const ScheduleGeneratorModal: React.FC<ScheduleGeneratorModalProps> = ({ isOpen, onClose, onGenerate, hasSyllabus, semester }) => {
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [targetDate, setTargetDate] = useState('');
  const [includedDays, setIncludedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
       // Default target date: 30 days from now
       const date = new Date();
       date.setDate(date.getDate() + 30);
       setTargetDate(date.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const toggleDay = (day: string) => {
    if (includedDays.includes(day)) {
        if (includedDays.length > 1) {
            setIncludedDays(prev => prev.filter(d => d !== day));
        }
    } else {
        setIncludedDays(prev => [...prev, day]);
    }
  };

  const isReady = hasSyllabus && hoursPerDay > 0 && targetDate && includedDays.length > 0 && semester;

  const handleGenerateClick = () => {
    if (isReady) {
        onGenerate({
            hoursPerDay,
            targetDate,
            includedDays
        });
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-graphite-surface rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-graphite-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-graphite-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main">Generate Schedule</h2>
            <p className="text-sm text-slate-500 dark:text-graphite-text-sub font-medium">Configure your personal study roadmap.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-graphite-secondary rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
           
           {/* Requirement Checklist */}
           <div className="bg-slate-50 dark:bg-graphite-base p-4 rounded-xl border border-slate-100 dark:border-graphite-border">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-3">Prerequisites</h4>
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-sm font-bold">
                    {semester ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">✗</span>}
                    <span className={semester ? 'text-slate-700 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}>Semester Selected {semester ? `(${semester})` : ''}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold">
                    {hasSyllabus ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">✗</span>}
                    <span className={hasSyllabus ? 'text-slate-700 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}>Syllabus Data Available</span>
                 </div>
                 {!hasSyllabus && (
                     <p className="text-xs text-rose-500 ml-6 mt-1 font-medium">Please use "Syllabus Scan" first.</p>
                 )}
              </div>
           </div>

           {/* Config Form */}
           <div className={`space-y-6 ${!hasSyllabus ? 'opacity-50 pointer-events-none' : ''}`}>
               
               {/* Daily Hours */}
               <div>
                  <div className="flex justify-between mb-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted">Daily Study Budget</label>
                     <span className="text-sm font-black text-indigo-600 dark:text-graphite-text-main">{hoursPerDay} Hours</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 dark:accent-graphite-action h-2 bg-slate-200 dark:bg-graphite-border rounded-lg appearance-none cursor-pointer"
                  />
               </div>

               {/* Study Days */}
               <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted mb-3 block">Preferred Study Days</label>
                  <div className="flex justify-between gap-2">
                     {days.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                            ${includedDays.includes(day) 
                              ? 'bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base shadow-md' 
                              : 'bg-slate-100 dark:bg-graphite-secondary text-slate-400 dark:text-graphite-text-muted'}
                          `}
                        >
                           {day}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Target Date */}
               <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted mb-2 block">Target Date (Exam/Deadline)</label>
                  <input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-xl font-bold text-slate-800 dark:text-graphite-text-main outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub transition-all"
                  />
               </div>

           </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-graphite-border flex justify-end gap-3 bg-slate-50 dark:bg-graphite-base rounded-b-[2rem]">
          <button onClick={onClose} className="px-6 py-3 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
            Cancel
          </button>
          <div className="relative group">
            <button 
                onClick={handleGenerateClick}
                disabled={!isReady}
                className={`px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                  ${!isReady ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'hover:scale-105 active:scale-95'}
                `}
            >
                Generate Plan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7m7-7H3" /></svg>
            </button>
            {!isReady && (
                <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                    Please complete all requirements above.
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleGeneratorModal;
