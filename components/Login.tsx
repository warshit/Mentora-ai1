
import React, { useState, useEffect, useMemo } from 'react';
import { StudentProfile, UserPreferences, LearningCategory, ExplanationStyle, ProductivityStats, PomodoroSettings } from '../types';

interface AuthProps {
  onLogin: (profile: StudentProfile) => void;
}

// Simulated User Database Type
interface UserRecord {
  rollNumber: string;
  password: string; // In a real app, this would be hashed
  profile: StudentProfile;
}

const MOTIVATIONAL_QUOTES = [
  "Consistency is the code to success.",
  "Small steps every day.",
  "Focus. Learn. Grow.",
  "Building momentum, one login at a time.",
  "Your potential is loading..."
];

const Login: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Random quote on mount
  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // Clear messages on mode switch
  useEffect(() => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setIsSuccess(false);
  }, [isLoginMode]);

  // STRICT ROLL NUMBER VALIDATION
  // Format: 2 chars (Year) + 4 chars (College) + 2 chars (Branch) + 2 chars (ID) = 10 Total
  // Example: 23951a66p1
  const isValidRollFormat = (roll: string) => {
    const regex = /^\d{2}[a-zA-Z0-9]{4}\d{2}[a-zA-Z0-9]{2}$/;
    return roll.length === 10 && regex.test(roll);
  };

  // Progress Calculation for Gamification
  const formProgress = useMemo(() => {
    let progress = 0;
    if (isValidRollFormat(rollNumber)) progress += 50;
    if (password.length >= 8) progress += 50;
    return progress;
  }, [rollNumber, password]);

  const getBranchFromCode = (code: string): string => {
    const map: Record<string, string> = {
      '05': 'CSE',
      '12': 'IT',
      '04': 'ECE',
      '03': 'MECH',
      '02': 'EEE',
      '01': 'CIVIL',
      '66': 'AIML',
      '67': 'DS',
      '62': 'CS (Cyber)'
    };
    return map[code] || 'General';
  };

  const deriveProfile = (roll: string): StudentProfile => {
    const cleanRoll = roll.toLowerCase();
    
    // Extract parts based on strict 10-char format
    // Indices: 01 (Year), 2345 (College), 67 (Branch), 89 (ID)
    const yearStr = cleanRoll.substring(0, 2);
    const branchCode = cleanRoll.substring(6, 8);

    // Calculate Academic Year (Approximate)
    const admissionYear = 2000 + parseInt(yearStr);
    const currentYear = new Date().getFullYear();
    const calculatedYear = Math.max(1, Math.min(4, currentYear - admissionYear + 1));

    // Default Preferences
    const defaultPreferences: UserPreferences = {
        theme: 'light', 
        defaultMode: LearningCategory.ACADEMIC,
        explanationStyle: ExplanationStyle.COMPANION,
        notifications: {
            quizReminders: true,
            revisionReminders: true
        },
        textSize: 'medium'
    };

    // Default Productivity Stats
    const defaultProductivity: ProductivityStats = {
      totalFocusMinutes: 0,
      sessionsCompleted: 0,
      dailyStreak: 0,
      lastSessionDate: '',
      todaySessions: 0
    };

    const defaultPomodoroSettings: PomodoroSettings = {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreak: false,
      soundEnabled: true
    };

    return {
      rollNumber: cleanRoll,
      department: getBranchFromCode(branchCode),
      year: calculatedYear,
      memory: {
        historicalWeakTopics: [],
        completedCredits: 0
      },
      topicNotes: {},
      preferences: defaultPreferences,
      productivity: defaultProductivity,
      pomodoroSettings: defaultPomodoroSettings
    };
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanRoll = rollNumber.toLowerCase().trim();

    // 1. Roll Number Validation
    if (!isValidRollFormat(cleanRoll)) {
      setError('Invalid roll number format. Must be exactly 10 characters (e.g., 23951a66p1).');
      return;
    }

    // 2. Password Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // 3. Check for duplicates
    const users = JSON.parse(localStorage.getItem('study_ai_users_db') || '{}');
    if (users[cleanRoll]) {
      setError('Account already exists. Please login.');
      return;
    }

    // 4. Create Account
    const profile = deriveProfile(cleanRoll);
    const newUser: UserRecord = {
      rollNumber: cleanRoll,
      password: password,
      profile: profile
    };

    users[cleanRoll] = newUser;
    localStorage.setItem('study_ai_users_db', JSON.stringify(users));

    // TRIGGER SUCCESS GAMIFICATION
    setIsSuccess(true);
    setTimeout(() => {
        setIsLoginMode(true);
        setIsSuccess(false);
        setPassword('');
        setConfirmPassword('');
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanRoll = rollNumber.toLowerCase().trim();

    // 1. Validation
    if (!isValidRollFormat(cleanRoll)) {
      setError('Invalid roll number format.');
      return;
    }

    // 2. Check Database
    const users = JSON.parse(localStorage.getItem('study_ai_users_db') || '{}');
    const user = users[cleanRoll];

    if (!user) {
      setError('No account found. Please sign up first.');
      return;
    }

    // 3. Verify Password
    if (user.password !== password) {
      setError('Incorrect password.');
      return;
    }

    // 4. Authenticate with Gamification Delay
    setIsSuccess(true);
    setTimeout(() => {
        onLogin(user.profile);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-graphite-base flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl w-full bg-white dark:bg-graphite-surface rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-graphite-border min-h-[600px]">
        
        {/* LEFT SECTION: BRANDING & MISSION */}
        <div className="w-full md:w-5/12 bg-indigo-600 dark:bg-graphite-secondary p-10 md:p-14 flex flex-col justify-between text-white dark:text-graphite-text-main relative overflow-hidden">
          {/* Abstract pattern overlay */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <svg className="w-64 h-64 text-white dark:text-graphite-text-main" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 dark:bg-graphite-base/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/20 dark:border-graphite-border/20">
              <svg className="w-6 h-6 text-white dark:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-6">
              A Rule-Based & Analytics-Driven AI Learning Companion
            </h1>
            
            <p className="text-indigo-100 dark:text-graphite-text-sub text-lg font-medium leading-relaxed opacity-90">
              Personalized academic and skill learning powered by logic and insights.
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
             <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-indigo-200 dark:text-graphite-text-muted">
               <span>Adaptive</span>
               <span className="w-1 h-1 bg-indigo-400 dark:bg-graphite-text-sub rounded-full"></span>
               <span>Structured</span>
               <span className="w-1 h-1 bg-indigo-400 dark:bg-graphite-text-sub rounded-full"></span>
               <span>Secure</span>
             </div>
          </div>
        </div>

        {/* RIGHT SECTION: LOGIN FORM */}
        <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white dark:bg-graphite-surface relative">
          
          {/* Micro-Reward / Success Overlay */}
          {isSuccess && (
             <div className="absolute inset-0 z-20 bg-white dark:bg-graphite-surface flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-6 animate-bounce">
                   <svg className="w-10 h-10 text-emerald-500 dark:text-graphite-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main mb-2 tracking-tight">Identity Verified</h3>
                <p className="text-emerald-600 dark:text-graphite-success font-bold uppercase tracking-widest text-xs">+1 Consistency Point</p>
             </div>
          )}

          <div className="max-w-md mx-auto w-full">
            
            {/* Gamified Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main">
                   {isLoginMode ? 'Welcome back' : 'Join the elite'}
                 </h2>
                 {isLoginMode && (
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-graphite-secondary text-indigo-600 dark:text-graphite-text-sub text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-graphite-border">
                       Consistency Builder
                    </span>
                 )}
              </div>
              <p className="text-slate-500 dark:text-graphite-text-sub text-sm font-medium">
                {isLoginMode ? quote : 'Your learning journey starts today.'}
              </p>
            </div>

            {/* Progress Bar (Visual Feedback) */}
            <div className="w-full h-1 bg-slate-100 dark:bg-graphite-border rounded-full mb-8 overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 dark:bg-graphite-action transition-all duration-500 ease-out" 
                 style={{ width: `${formProgress}%` }}
               ></div>
            </div>

            <form onSubmit={isLoginMode ? handleLogin : handleSignup} className="space-y-5">
              
              {/* Roll Number */}
              <div className="space-y-2 group">
                <div className="flex justify-between">
                   <label className="block text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">
                     Roll Number
                   </label>
                   {isValidRollFormat(rollNumber) && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-graphite-success animate-in fade-in">Valid Format</span>
                   )}
                </div>
                <div className="relative">
                   <input 
                     type="text" 
                     value={rollNumber}
                     onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                     placeholder="23951A66P1"
                     maxLength={10}
                     autoFocus
                     className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-mono font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted uppercase"
                     required
                   />
                   {isValidRollFormat(rollNumber) && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-graphite-success">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      </div>
                   )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between">
                   <label className="block text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">
                     Password
                   </label>
                   {password.length >= 8 && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-graphite-success animate-in fade-in">Length OK</span>
                   )}
                </div>
                <div className="relative">
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted"
                     required
                   />
                   {password.length >= 8 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-graphite-success">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      </div>
                   )}
                </div>
              </div>

              {/* Confirm Password (Signup only) */}
              {!isLoginMode && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted"
                    required
                  />
                </div>
              )}

              {/* Error Message - Serious Tone */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-graphite-secondary border border-rose-100 dark:border-graphite-error rounded-lg flex items-center gap-3 text-rose-600 dark:text-graphite-text-main text-xs font-bold animate-in fade-in duration-200">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-graphite-secondary dark:border dark:border-graphite-border dark:text-graphite-text-main dark:hover:bg-graphite-input active:bg-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                {isLoginMode ? 'Access Dashboard' : 'Initialize Account'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              {/* Dynamic Status Text */}
              <div className="text-center h-4">
                 <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted font-bold uppercase tracking-widest animate-pulse">
                    {formProgress === 100 ? 'Credentials Ready' : 'Verifying Format...'}
                 </p>
              </div>

            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 dark:text-graphite-text-sub font-medium">
                {isLoginMode ? "First time here?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="ml-2 text-indigo-600 dark:text-graphite-text-main font-bold hover:underline transition-all"
                >
                  {isLoginMode ? 'Start your journey' : 'Resume progress'}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-graphite-border flex justify-center items-center gap-2 text-[10px] text-slate-400 dark:text-graphite-text-disabled font-medium uppercase tracking-widest">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               Secure login • Encrypted Session
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
