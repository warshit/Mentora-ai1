import React, { useState, useEffect } from 'react';
import { signUpWithEmail, signInWithEmail, extractRollNumber } from '../services/authService';
import { StudentProfile, UserPreferences, LearningCategory, ExplanationStyle, ProductivityStats, PomodoroSettings } from '../types';

interface AuthProps {
  onLogin: (profile: StudentProfile) => void;
  onLoginSuccess?: () => void; // New prop for post-login actions
}

const MOTIVATIONAL_QUOTES = [
  "Consistency is the code to success.",
  "Small steps every day.",
  "Focus. Learn. Grow.",
  "Building momentum, one login at a time.",
  "Your potential is loading..."
];

const Login: React.FC<AuthProps> = ({ onLogin, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Email validation for @iare.ac.in domain
  const isValidEmail = (email: string) => {
    return email.toLowerCase().endsWith('@iare.ac.in');
  };

  // Create default profile from email
  const createDefaultProfile = (email: string): StudentProfile => {
    const rollNumber = extractRollNumber(email);
    
    // Extract branch code from roll number (positions 6-7)
    const branchCode = rollNumber.substring(6, 8);
    
    const getBranchName = (code: string) => {
      const map: Record<string, string> = {
        '05': 'CSE',
        '12': 'IT',
        '04': 'ECE',
        '03': 'MECH',
        '02': 'EEE',
        '01': 'CIVIL',
        '66': 'AIML',
        '67': 'DS',
        '62': 'CS (Cyber Security)'
      };
      return map[code] || 'Unknown';
    };

    const yearStr = rollNumber.substring(0, 2);
    const admissionYear = 2000 + parseInt(yearStr);
    const currentYear = new Date().getFullYear();
    const calculatedYear = Math.max(1, Math.min(4, currentYear - admissionYear + 1));

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
      rollNumber,
      department: getBranchName(branchCode),
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      setError('Only @iare.ac.in emails are allowed.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Create Firebase account
      await signUpWithEmail(cleanEmail, password);
      
      // Show success feedback
      setIsSuccess(true);
      setTimeout(() => {
        setIsLoginMode(true);
        setIsSuccess(false);
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      setError('Only @iare.ac.in emails are allowed.');
      setIsLoading(false);
      return;
    }

    try {
      // Firebase authentication
      const user = await signInWithEmail(cleanEmail, password);
      
      // Create profile
      const profile = createDefaultProfile(cleanEmail);
      
      // Delayed login for smooth UX
      setTimeout(() => {
        onLogin(profile);
        // Redirect to dashboard after successful login
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 1200);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-graphite-bg dark:via-graphite-surface dark:to-graphite-bg flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white dark:bg-graphite-surface rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-graphite-border">
        
        {/* Left Panel - Branding */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-graphite-secondary dark:to-graphite-bg relative p-8 md:p-12 flex flex-col justify-between text-white dark:text-graphite-text-main">
          {/* Abstract pattern overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
             <svg className="w-64 h-64 text-white dark:text-graphite-text-main" fill="currentColor" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" />
             </svg>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white dark:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Mentora AI
            </h1>
            
            <p className="text-lg text-white/90 dark:text-graphite-text-sub leading-relaxed">
              Your personalized AI learning companion for IARE students.
            </p>
          </div>

          <div className="relative z-10">
             <div className="flex items-center gap-3 text-sm text-white/80 dark:text-graphite-text-muted">
               <span>Secure</span>
               <span className="w-1 h-1 bg-white/60 rounded-full"></span>
               <span>Personal</span>
               <span className="w-1 h-1 bg-white/60 rounded-full"></span>
               <span>Smart</span>
             </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative">
          
           {/* Success Animation */}
          {isSuccess && (
             <div className="absolute inset-0 bg-white dark:bg-graphite-surface flex items-center justify-center z-50">
                <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-6 animate-bounce mx-auto">
                   <svg className="w-10 h-10 text-emerald-500 dark:text-graphite-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-2">
                  {isLoginMode ? 'Welcome Back!' : 'Account Created!'}
                </h3>
                <p className="text-slate-600 dark:text-graphite-text-sub">Redirecting you...</p>
                </div>
            </div>
       )}

          <div className="max-w-md mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main">
                   {isLoginMode ? 'Welcome Back' : 'Create Account'}
                 </h2>
                 <span className="px-3 py-1 bg-indigo-50 dark:bg-graphite-secondary text-indigo-600 dark:text-graphite-text-sub text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-graphite-border">
                    IARE Only
                 </span>
              </div>
              <p className="text-slate-600 dark:text-graphite-text-sub">
                {isLoginMode ? quote : 'Your learning journey starts today.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-graphite-border rounded-full mb-8 overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-graphite-action dark:to-graphite-success transition-all duration-500 ease-out" 
                 style={{ width: `${isValidEmail(email) && password.length >= 6 ? 100 : isValidEmail(email) || password.length > 0 ? 50 : 0}%` }}
               ></div>
            </div>

            <form onSubmit={isLoginMode ? handleSignIn : handleSignUp} className="space-y-6">
              
              {/* Email */}
              <div className="space-y-2 group">
                <div className="flex justify-between">
                   <label className="block text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">
                     IARE Email
                   </label>
                   {isValidEmail(email) && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-graphite-success animate-in fade-in">Valid Domain</span>
                   )}
                </div>
                <div className="relative">
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="23951a66p1@iare.ac.in"
                     autoFocus
                     disabled={isLoading}
                     className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-mono font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted lowercase disabled:opacity-50"
                     required
                   />
                   {isValidEmail(email) && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-graphite-success">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                      </div>
                   )}
                </div>
                {email && !isValidEmail(email) && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                    Only @iare.ac.in emails are allowed
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between">
                   <label className="block text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">
                     Password
                   </label>
                   {password.length >= 6 && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-graphite-success animate-in fade-in">Length OK</span>
                   )}
                </div>
                <div className="relative">
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     disabled={isLoading}
                     className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted disabled:opacity-50"
                     required
                   />
                   {password.length >= 6 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-graphite-success">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                      </div>
                   )}
                </div>
              </div>

              {/* Confirm Password */}
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
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-0 focus:border-indigo-500 dark:focus:border-graphite-action outline-none transition-all font-medium text-slate-800 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted disabled:opacity-50"
                    required
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-graphite-secondary dark:hover:bg-graphite-action text-white dark:text-graphite-text-main font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoginMode ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {isLoginMode ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
              
              {/* Status Text */}
              <div className="text-center">
                 <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted font-medium uppercase tracking-widest">
                    {isValidEmail(email) && password.length >= 6 ? 'Ready to proceed' : 'Complete the form above'}
                 </p>
              </div>

            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-graphite-text-sub">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  disabled={isLoading}
                  className="text-indigo-600 dark:text-graphite-action hover:text-indigo-700 dark:hover:text-graphite-success font-bold transition-colors disabled:opacity-50"
                >
                  {isLoginMode ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;