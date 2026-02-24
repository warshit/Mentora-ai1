
import React, { useState } from 'react';
import { StudentProfile, Subject, StudySession, LearningCategory, UserPreferences, ExplanationStyle } from '../types';
import { MOCK_CURRICULUM } from '../constants';

interface ProfilePageProps {
  student: StudentProfile;
  sessions: StudySession[];
  onLogout: () => void;
  currentSemester: string;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  student, 
  sessions, 
  onLogout, 
  currentSemester,
  preferences,
  onUpdatePreferences
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- STATISTICS CALCULATION ---
  const calculateStats = (data: Subject[]) => {
    let completed = 0;
    let inProgress = 0;
    let total = 0;
    data.forEach(sub => sub.units.forEach(u => u.topics.forEach(t => {
      total++;
      if (t.status === 'Completed') completed++;
      if (t.status === 'In Progress') inProgress++;
    })));
    return { total, completed, inProgress };
  };

  const academicSubjects = MOCK_CURRICULUM[student.department] || [];
  const upskillSubjects = MOCK_CURRICULUM['UPSKILL'] || [];
  const academicStats = calculateStats(academicSubjects);
  const upskillStats = calculateStats(upskillSubjects);

  // --- RECENT ACTIVITY ---
  const recentSessions = sessions.slice(0, 4);
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // --- HANDLERS ---
  const handleToggle = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({ ...preferences, [key]: value });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (newPassword.length < 8) {
        setMsg({ text: 'Password must be 8+ characters', type: 'error' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setMsg({ text: 'Passwords do not match', type: 'error' });
        return;
    }

    const db = JSON.parse(localStorage.getItem('study_ai_users_db') || '{}');
    const key = student.rollNumber.toLowerCase();
    const userRecord = db[key];

    if (!userRecord || userRecord.password !== currentPassword) {
        setMsg({ text: 'Current password incorrect', type: 'error' });
        return;
    }

    userRecord.password = newPassword;
    localStorage.setItem('study_ai_users_db', JSON.stringify(db));
    setMsg({ text: 'Password updated', type: 'success' });
    setTimeout(() => { setIsChangingPassword(false); setMsg({text:'', type:''}); }, 1500);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  if (!student) return <div className="p-20 text-center text-slate-400">Unable to load profile. Please refresh.</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans text-slate-800 dark:text-graphite-text-main animate-in fade-in duration-500">
      
      {/* SECTION 1: PROFILE SUMMARY CARD */}
      <div className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col sm:flex-row items-center gap-8 mb-10">
         <div className="w-24 h-24 rounded-full bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base flex items-center justify-center text-3xl font-black shadow-xl shrink-0 border-4 border-white dark:border-graphite-surface">
            {student.rollNumber.substring(0, 2)}
         </div>
         <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight uppercase mb-2">{student.rollNumber}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center text-sm font-medium text-slate-500 dark:text-graphite-text-sub">
                <span className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-graphite-border"></span>
                <span>{student.department} Student</span>
            </div>
         </div>
      </div>

      {/* SECTION 2: QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         <div className="bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-colors group">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">Academic Done</p>
            <p className="text-2xl font-black text-slate-800 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-graphite-action transition-colors">{academicStats.completed}</p>
         </div>
         <div className="bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-colors group">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">Academic Active</p>
            <p className="text-2xl font-black text-slate-800 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-graphite-action transition-colors">{academicStats.inProgress}</p>
         </div>
         <div className="bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm hover:border-amber-300 dark:hover:border-graphite-text-sub transition-colors group">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">Skills Started</p>
            <p className="text-2xl font-black text-slate-800 dark:text-graphite-text-main group-hover:text-amber-600 dark:group-hover:text-graphite-text-sub transition-colors">{upskillStats.inProgress}</p>
         </div>
         <div className="bg-white dark:bg-graphite-surface p-5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm hover:border-amber-300 dark:hover:border-graphite-text-sub transition-colors group">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">Skills Mastered</p>
            <p className="text-2xl font-black text-slate-800 dark:text-graphite-text-main group-hover:text-amber-600 dark:group-hover:text-graphite-text-sub transition-colors">{upskillStats.completed}</p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         
         {/* LEFT COLUMN */}
         <div className="space-y-8">
            
            {/* SECTION 3: ACADEMIC INFO */}
            <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Academic Details</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-graphite-border">
                      <span className="text-sm font-medium text-slate-500 dark:text-graphite-text-sub">Admission Year</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-graphite-text-main font-mono">20{student.rollNumber.substring(0,2)}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-graphite-border">
                      <span className="text-sm font-medium text-slate-500 dark:text-graphite-text-sub">Current Semester</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-graphite-text-main">Semester {currentSemester}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-graphite-border">
                      <span className="text-sm font-medium text-slate-500 dark:text-graphite-text-sub">Branch Code</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-graphite-text-main font-mono">{student.rollNumber.substring(6,8)}</span>
                   </div>
                </div>
            </section>

            {/* SECTION 5: PREFERENCES (INLINE) */}
            <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Quick Preferences</h3>
                
                {/* Theme Toggle */}
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-graphite-text-main">App Theme</p>
                      <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted mt-0.5">Visual appearance</p>
                   </div>
                   <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-lg">
                      <button 
                        onClick={() => handleToggle('theme', 'light')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.theme === 'light' ? 'bg-white dark:bg-graphite-surface shadow-sm text-slate-900 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Light</button>
                      <button 
                        onClick={() => handleToggle('theme', 'dark')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.theme === 'dark' ? 'bg-white dark:bg-graphite-surface shadow-sm text-slate-900 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Dark</button>
                   </div>
                </div>

                {/* Default Mode */}
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-graphite-text-main">Startup Mode</p>
                      <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted mt-0.5">Default dashboard</p>
                   </div>
                   <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-lg">
                      <button 
                        onClick={() => handleToggle('defaultMode', LearningCategory.ACADEMIC)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.defaultMode === LearningCategory.ACADEMIC ? 'bg-white dark:bg-graphite-surface shadow-sm text-indigo-700 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Academic</button>
                      <button 
                        onClick={() => handleToggle('defaultMode', LearningCategory.UPSKILL)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.defaultMode === LearningCategory.UPSKILL ? 'bg-white dark:bg-graphite-surface shadow-sm text-amber-700 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Upskill</button>
                   </div>
                </div>

                {/* Explanation Style */}
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-graphite-text-main">AI Persona</p>
                      <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted mt-0.5">Explanation tone</p>
                   </div>
                   <div className="flex bg-slate-100 dark:bg-graphite-base p-1 rounded-lg">
                      <button 
                        onClick={() => handleToggle('explanationStyle', ExplanationStyle.COMPANION)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.explanationStyle === ExplanationStyle.COMPANION ? 'bg-white dark:bg-graphite-surface shadow-sm text-slate-900 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Concept</button>
                      <button 
                        onClick={() => handleToggle('explanationStyle', ExplanationStyle.PROFESSOR)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${preferences.explanationStyle === ExplanationStyle.PROFESSOR ? 'bg-white dark:bg-graphite-surface shadow-sm text-slate-900 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}
                      >Exam</button>
                   </div>
                </div>
            </section>
         </div>

         {/* RIGHT COLUMN */}
         <div className="space-y-8">
            
            {/* SECTION 4: RECENT ACTIVITY */}
            <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm min-h-[300px]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Recent Activity</h3>
                {recentSessions.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-graphite-border">
                        {recentSessions.map((session) => (
                            <div key={session.id} className="relative pl-10">
                                <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-white dark:bg-graphite-surface">
                                   <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-graphite-surface shadow-sm ${session.category === 'ACADEMIC' ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-graphite-text-main truncate">{session.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] font-mono text-slate-400 dark:text-graphite-text-muted">{formatDate(session.lastUpdated)}</span>
                                   <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${session.category === 'ACADEMIC' ? 'bg-indigo-50 dark:bg-graphite-base text-indigo-600 dark:text-graphite-text-sub' : 'bg-amber-50 dark:bg-graphite-base text-amber-600 dark:text-graphite-text-sub'}`}>
                                      {session.category}
                                   </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-center">
                        <p className="text-sm text-slate-400 dark:text-graphite-text-muted italic">Your recent activity will appear here.</p>
                    </div>
                )}
            </section>

            {/* SECTION 6: ACCOUNT ACTIONS */}
            <section className="bg-white dark:bg-graphite-surface rounded-[2rem] p-8 border border-slate-200 dark:border-graphite-border shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Account Actions</h3>
                
                {!isChangingPassword ? (
                   <div className="space-y-3">
                      <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="w-full py-3 bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
                      >
                        Change Password
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm"
                      >
                        Log Out
                      </button>
                   </div>
                ) : (
                   <form onSubmit={handleChangePassword} className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        className="w-full bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub transition-colors dark:text-graphite-text-main"
                        required
                      />
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password (min 8 chars)"
                        className="w-full bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub transition-colors dark:text-graphite-text-main"
                        required
                      />
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub transition-colors dark:text-graphite-text-main"
                        required
                      />
                      
                      {msg.text && (
                         <div className={`text-[10px] font-bold text-center py-1 ${msg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {msg.text}
                         </div>
                      )}

                      <div className="flex gap-2 pt-2">
                         <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2.5 text-slate-500 dark:text-graphite-text-muted font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-graphite-base rounded-lg transition-colors">Cancel</button>
                         <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors shadow-sm">Update</button>
                      </div>
                   </form>
                )}
            </section>
         </div>
      </div>
    </div>
  );
};

export default ProfilePage;
