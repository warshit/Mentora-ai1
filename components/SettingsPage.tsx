
import React from 'react';
import { StudentProfile, UserPreferences, LearningCategory, ExplanationStyle } from '../types';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  onLogout: () => void;
  lastLoginTime?: number;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ preferences, onUpdatePreferences, onLogout, lastLoginTime }) => {
  
  const handleToggle = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({ ...preferences, [key]: value });
  };

  const handleNotificationToggle = (key: 'quizReminders' | 'revisionReminders') => {
    onUpdatePreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800 dark:text-graphite-text-main">
      
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-graphite-text-sub font-medium">Manage your learning environment and core preferences.</p>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: APPEARANCE */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Appearance</h3>
           
           <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-graphite-text-main">Interface Theme</p>
                <p className="text-xs text-slate-500 dark:text-graphite-text-muted mt-1">Select your preferred visual style.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-xl">
                 <button 
                   onClick={() => handleToggle('theme', 'light')}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${preferences.theme === 'light' ? 'bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main shadow-sm' : 'text-slate-500 dark:text-graphite-text-muted'}`}
                 >Light</button>
                 <button 
                   onClick={() => handleToggle('theme', 'dark')}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${preferences.theme === 'dark' ? 'bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main shadow-sm' : 'text-slate-500 dark:text-graphite-text-muted'}`}
                 >Dark</button>
              </div>
           </div>
        </section>

        {/* SECTION 2: DEFAULT MODE */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Default Mode on Login</h3>
           
           <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-graphite-secondary cursor-pointer transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferences.defaultMode === LearningCategory.ACADEMIC ? 'border-indigo-600 dark:border-graphite-text-main' : 'border-slate-300 dark:border-graphite-text-muted'}`}>
                       {preferences.defaultMode === LearningCategory.ACADEMIC && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-graphite-text-main"></div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-graphite-text-main">Academic Mode</p>
                      <p className="text-xs text-slate-500 dark:text-graphite-text-muted">Focus on university syllabus and exams.</p>
                    </div>
                 </div>
                 <input 
                   type="radio" 
                   name="defaultMode" 
                   className="hidden" 
                   checked={preferences.defaultMode === LearningCategory.ACADEMIC} 
                   onChange={() => handleToggle('defaultMode', LearningCategory.ACADEMIC)} 
                 />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-graphite-secondary cursor-pointer transition-colors">
                 <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferences.defaultMode === LearningCategory.UPSKILL ? 'border-indigo-600 dark:border-graphite-text-main' : 'border-slate-300 dark:border-graphite-text-muted'}`}>
                       {preferences.defaultMode === LearningCategory.UPSKILL && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-graphite-text-main"></div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-graphite-text-main">Upskill Mode</p>
                      <p className="text-xs text-slate-500 dark:text-graphite-text-muted">Focus on career skills and interviews.</p>
                    </div>
                 </div>
                 <input 
                   type="radio" 
                   name="defaultMode" 
                   className="hidden" 
                   checked={preferences.defaultMode === LearningCategory.UPSKILL} 
                   onChange={() => handleToggle('defaultMode', LearningCategory.UPSKILL)} 
                 />
              </label>
           </div>
        </section>

        {/* SECTION 3: LEARNING PREFERENCES */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Learning Preferences</h3>
           
           <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-graphite-text-main">Default Explanation Style</p>
                <p className="text-xs text-slate-500 dark:text-graphite-text-muted mt-1">Sets the tone for AI responses.</p>
              </div>
              <select 
                value={preferences.explanationStyle}
                onChange={(e) => handleToggle('explanationStyle', e.target.value)}
                className="bg-slate-100 dark:bg-graphite-base border-none text-xs font-bold text-slate-800 dark:text-graphite-text-main py-2 px-4 rounded-xl outline-none focus:ring-1 focus:ring-indigo-300 dark:focus:ring-graphite-text-sub"
              >
                <option value={ExplanationStyle.COMPANION}>Concept Mode (Friendly)</option>
                <option value={ExplanationStyle.PROFESSOR}>Exam Mode (Formal)</option>
              </select>
           </div>
        </section>

        {/* SECTION 4: NOTIFICATIONS */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Notifications</h3>
           
           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-graphite-text-main text-sm">Quiz Reminders</span>
                <button 
                  onClick={() => handleNotificationToggle('quizReminders')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications.quizReminders ? 'bg-indigo-600 dark:bg-graphite-action' : 'bg-slate-200 dark:bg-graphite-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white dark:bg-graphite-base shadow-sm absolute top-1 transition-all ${preferences.notifications.quizReminders ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
             <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-graphite-text-main text-sm">Revision Reminders</span>
                <button 
                  onClick={() => handleNotificationToggle('revisionReminders')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications.revisionReminders ? 'bg-indigo-600 dark:bg-graphite-action' : 'bg-slate-200 dark:bg-graphite-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white dark:bg-graphite-base shadow-sm absolute top-1 transition-all ${preferences.notifications.revisionReminders ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
           </div>
        </section>

        {/* SECTION 5: ACCESSIBILITY */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Accessibility</h3>
           
           <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-graphite-text-main">Text Size</p>
                <p className="text-xs text-slate-500 dark:text-graphite-text-muted mt-1">Adjusts content readability.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-xl">
                 <button 
                   onClick={() => handleToggle('textSize', 'small')}
                   className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${preferences.textSize === 'small' ? 'bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main shadow-sm' : 'text-slate-500 dark:text-graphite-text-muted'}`}
                 >Small</button>
                 <button 
                   onClick={() => handleToggle('textSize', 'medium')}
                   className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${preferences.textSize === 'medium' ? 'bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main shadow-sm' : 'text-slate-500 dark:text-graphite-text-muted'}`}
                 >Medium</button>
                 <button 
                   onClick={() => handleToggle('textSize', 'large')}
                   className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${preferences.textSize === 'large' ? 'bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main shadow-sm' : 'text-slate-500 dark:text-graphite-text-muted'}`}
                 >Large</button>
              </div>
           </div>
        </section>

        {/* SECTION 6: DATA & PRIVACY */}
        <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Account Status</h3>
           
           <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-slate-600 dark:text-graphite-text-sub">Session Status</span>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-graphite-secondary text-emerald-700 dark:text-graphite-text-main text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-200 dark:border-graphite-border">Active</span>
           </div>
           
           {lastLoginTime && (
             <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-slate-600 dark:text-graphite-text-sub">Last Login</span>
                <span className="text-xs font-mono text-slate-400 dark:text-graphite-text-muted">{new Date(lastLoginTime).toLocaleString()}</span>
             </div>
           )}

           <button 
             onClick={onLogout}
             className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
           >
              Log Out
           </button>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
