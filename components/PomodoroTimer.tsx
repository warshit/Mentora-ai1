
import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, PomodoroSettings, ProductivityStats } from '../types';

interface PomodoroTimerProps {
  student: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
}

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreak: false,
  soundEnabled: true
};

const DEFAULT_STATS: ProductivityStats = {
  totalFocusMinutes: 0,
  sessionsCompleted: 0,
  dailyStreak: 0,
  lastSessionDate: '',
  todaySessions: 0
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ student, onUpdateProfile }) => {
  // Safe Access to props
  const settings = student.pomodoroSettings || DEFAULT_SETTINGS;
  const stats = student.productivity || DEFAULT_STATS;

  // Local State
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings Form State
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  // Position State for Draggable Behavior
  const [position, setPosition] = useState<{x: number, y: number} | null>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('pomodoro_widget_pos');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }
    return null;
  });

  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  
  // Dragging Refs
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const containerRef = useRef<HTMLDivElement | HTMLButtonElement>(null);

  // Initialize timer on load & Validate Position
  useEffect(() => {
    resetTimer(mode);
    
    // Validate bounds if position exists
    if (position && typeof window !== 'undefined') {
        const { innerWidth, innerHeight } = window;
        if (position.x > innerWidth - 50 || position.y > innerHeight - 50 || position.x < 0 || position.y < 0) {
            setPosition(null); // Reset if off screen
        }
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        
        const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
        
        if (remaining <= 0) {
          handleComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 200); // Check frequently for accuracy
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      endTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const playSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setTimeLeft(0);
    playSound();

    if (mode === 'FOCUS') {
      updateStats();
      if (settings.autoStartBreak) {
        const nextMode = (stats.todaySessions + 1) % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
        switchMode(nextMode);
        setIsActive(true); // Auto start
      }
    } else {
      // Break over
      switchMode('FOCUS');
    }
  };

  const updateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = today !== stats.lastSessionDate;
    
    const newStats: ProductivityStats = {
      totalFocusMinutes: stats.totalFocusMinutes + settings.focusDuration,
      sessionsCompleted: stats.sessionsCompleted + 1,
      dailyStreak: isNewDay ? (stats.lastSessionDate === getYesterday() ? stats.dailyStreak + 1 : 1) : stats.dailyStreak,
      lastSessionDate: today,
      todaySessions: isNewDay ? 1 : stats.todaySessions + 1
    };

    onUpdateProfile({
      ...student,
      productivity: newStats
    });
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    resetTimer(newMode);
  };

  const resetTimer = (targetMode: TimerMode = mode) => {
    let duration = settings.focusDuration;
    if (targetMode === 'SHORT_BREAK') duration = settings.shortBreakDuration;
    if (targetMode === 'LONG_BREAK') duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
    endTimeRef.current = null;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const saveSettings = () => {
    onUpdateProfile({
      ...student,
      pomodoroSettings: tempSettings
    });
    setShowSettings(false);
    // If current timer is not active, apply new time immediately
    if (!isActive && mode === 'FOCUS') setTimeLeft(tempSettings.focusDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    if (mode === 'FOCUS') return 'text-indigo-600 dark:text-indigo-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getProgress = () => {
    let duration = settings.focusDuration;
    if (mode === 'SHORT_BREAK') duration = settings.shortBreakDuration;
    if (mode === 'LONG_BREAK') duration = settings.longBreakDuration;
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // --- DRAG HANDLERS ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent dragging if clicking specific controls inside (optional, but handling via ref targets is safer)
    if ((e.target as HTMLElement).closest('button') && !isExpanded) {
        // If minimized, we want button click to work, but also drag.
        // We will differentiate via hasMoved.
    }
    
    // Prevent dragging if interactng with sliders/buttons in expanded mode
    if (isExpanded && (e.target as HTMLElement).closest('button, input')) {
        return; 
    }

    if (e.button !== 0) return; // Left click only

    const target = e.currentTarget as HTMLElement;
    
    // If expanded, only allow header drag (check if target is within header)
    if (isExpanded) {
        const header = containerRef.current?.querySelector('.drag-handle');
        if (header && !header.contains(e.target as Node)) {
            return;
        }
    }

    // Capture initial state
    isDragging.current = true;
    hasMoved.current = false;
    
    // If we don't have a position yet (first drag), calculate from current rect
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        // If this is the first drag (position is null), we should set it now to prevent jump
        if (!position) {
             setPosition({ x: rect.left, y: rect.top });
        }
    }

    target.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    // Threshold to prevent micro-movements from cancelling clicks
    if (!hasMoved.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && Math.abs(e.clientX - (rect.left + dragOffset.current.x)) > 2) {
            hasMoved.current = true;
        }
    }

    if (hasMoved.current) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        
        // Bounds checking
        const w = containerRef.current?.offsetWidth || 300;
        const h = containerRef.current?.offsetHeight || 100;
        
        newX = Math.max(0, Math.min(newX, window.innerWidth - w));
        newY = Math.max(0, Math.min(newY, window.innerHeight - h));
        
        setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
        isDragging.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        
        if (hasMoved.current) {
            if (position) {
                localStorage.setItem('pomodoro_widget_pos', JSON.stringify(position));
            }
        }
    }
  };

  const handleMinimizeClick = () => {
      if (!hasMoved.current) {
          setIsExpanded(true);
      }
  };

  const containerStyle: React.CSSProperties = position 
    ? { left: position.x, top: position.y, bottom: 'auto', right: 'auto', transform: 'none' } 
    : {}; // Default CSS classes apply if null

  const commonClasses = `fixed z-[60] shadow-2xl transition-shadow ${position ? '' : 'bottom-6 right-6'} ${isDragging.current ? 'cursor-grabbing' : ''}`;

  if (!isExpanded) {
    return (
      <button 
        ref={containerRef as React.RefObject<HTMLButtonElement>}
        style={{ ...containerStyle, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleMinimizeClick}
        className={`${commonClasses} bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border rounded-full p-1 pr-5 flex items-center gap-3 hover:scale-105 active:scale-95 group animate-in fade-in zoom-in duration-300 cursor-grab`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${isActive ? 'bg-indigo-50 dark:bg-graphite-secondary' : 'bg-slate-100 dark:bg-graphite-secondary'}`}>
           <svg className="absolute inset-0 w-full h-full -rotate-90 text-slate-200 dark:text-graphite-border" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
           </svg>
           {isActive && (
             <svg className={`absolute inset-0 w-full h-full -rotate-90 transition-all duration-1000 ease-linear ${mode === 'FOCUS' ? 'text-indigo-500' : 'text-emerald-500'}`} viewBox="0 0 36 36">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeDasharray={`${getProgress()}, 100`} 
                />
             </svg>
           )}
           <span className="text-[10px] font-black z-10 relative">{isActive ? 'ON' : 'OFF'}</span>
        </div>
        <div className="flex flex-col items-start pointer-events-none">
           <span className={`text-sm font-mono font-bold ${getModeColor()}`}>{formatTime(timeLeft)}</span>
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{mode.replace('_', ' ')}</span>
        </div>
      </button>
    );
  }

  return (
    <div 
        ref={containerRef as React.RefObject<HTMLDivElement>}
        style={{ ...containerStyle, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`${commonClasses} animate-in fade-in zoom-in-95 duration-200`}
    >
      <div className="bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border rounded-[2rem] w-80 overflow-hidden font-sans shadow-xl">
        
        {/* Header - DRAGGABLE HANDLE */}
        <div className="drag-handle px-6 py-4 border-b border-slate-100 dark:border-graphite-border flex justify-between items-center bg-slate-50/50 dark:bg-graphite-base/50 cursor-grab active:cursor-grabbing">
           <div className="flex items-center gap-2 pointer-events-none">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted">Focus Timer</span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-graphite-border rounded-full transition-colors text-slate-400 cursor-pointer"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-graphite-border rounded-full transition-colors text-slate-400 cursor-pointer"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
           </div>
        </div>

        {showSettings ? (
          <div className="p-6 space-y-4 cursor-default">
             <div className="space-y-3">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Focus Duration (min)</label>
                   <input type="range" min="15" max="60" step="5" value={tempSettings.focusDuration} onChange={(e) => setTempSettings({...tempSettings, focusDuration: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                   <div className="text-right text-xs font-bold text-indigo-600">{tempSettings.focusDuration}m</div>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Short Break (min)</label>
                   <input type="range" min="2" max="10" step="1" value={tempSettings.shortBreakDuration} onChange={(e) => setTempSettings({...tempSettings, shortBreakDuration: parseInt(e.target.value)})} className="w-full accent-emerald-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                   <div className="text-right text-xs font-bold text-emerald-600">{tempSettings.shortBreakDuration}m</div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-600 dark:text-graphite-text-main">Sound Effects</span>
                   <button onClick={() => setTempSettings({...tempSettings, soundEnabled: !tempSettings.soundEnabled})} className={`w-10 h-5 rounded-full relative transition-colors ${tempSettings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tempSettings.soundEnabled ? 'left-6' : 'left-1'}`}></div>
                   </button>
                </div>
             </div>
             <button onClick={saveSettings} className="w-full py-2 bg-slate-900 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl text-xs font-bold uppercase tracking-widest mt-2 hover:opacity-90">Save Changes</button>
          </div>
        ) : (
          <div className="cursor-default">
            {/* Mode Switcher */}
            <div className="p-2 flex gap-1 justify-center bg-slate-50 dark:bg-graphite-secondary m-4 rounded-xl border border-slate-100 dark:border-graphite-border">
               <button onClick={() => switchMode('FOCUS')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${mode === 'FOCUS' ? 'bg-white dark:bg-graphite-action text-indigo-600 dark:text-graphite-base shadow-sm' : 'text-slate-400'}`}>Focus</button>
               <button onClick={() => switchMode('SHORT_BREAK')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${mode === 'SHORT_BREAK' ? 'bg-white dark:bg-graphite-action text-emerald-600 dark:text-graphite-base shadow-sm' : 'text-slate-400'}`}>Short</button>
               <button onClick={() => switchMode('LONG_BREAK')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${mode === 'LONG_BREAK' ? 'bg-white dark:bg-graphite-action text-emerald-600 dark:text-graphite-base shadow-sm' : 'text-slate-400'}`}>Long</button>
            </div>

            {/* Timer Display */}
            <div className="text-center py-4">
               <div className={`text-6xl font-mono font-black tracking-tighter ${getModeColor()}`}>
                  {formatTime(timeLeft)}
               </div>
               <p className="text-xs font-medium text-slate-400 mt-2">{isActive ? 'Stay focused, you got this!' : 'Ready to start?'}</p>
            </div>

            {/* Controls */}
            <div className="px-8 pb-8 flex items-center justify-center gap-4">
               <button 
                 onClick={toggleTimer}
                 className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${isActive ? 'bg-slate-400 dark:bg-graphite-secondary dark:text-white' : 'bg-indigo-600 dark:bg-graphite-action dark:text-graphite-base'}`}
               >
                  {isActive ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9v6h4V9h-4zm-3-5h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
               </button>
               <button 
                 onClick={() => resetTimer()}
                 className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-graphite-secondary text-slate-500 dark:text-graphite-text-muted hover:bg-slate-200 dark:hover:bg-graphite-border transition-all active:scale-95"
               >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>
            </div>

            {/* Stats Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-graphite-base border-t border-slate-100 dark:border-graphite-border flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-graphite-text-muted">
               <div>Sessions Today: <span className="text-slate-900 dark:text-graphite-text-main">{stats.todaySessions}</span></div>
               <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.298-2.26A6.008 6.008 0 016.51 3.29a.75.75 0 10-1.06 1.06c.408.408.66.82.793 1.22.132.403.16.923.065 1.554a9.73 9.73 0 00-.063 1.135c0 .356.02.737.063 1.135.086.797.26 1.636.572 2.396.476 1.16 1.272 2.156 2.395 2.628.26.11.53.18.803.213a.75.75 0 00.322-1.465 4.545 4.545 0 01-.734-.23 3.53 3.53 0 01-1.393-1.127 6.3 6.3 0 01-.58-1.728 20.35 20.35 0 01-.192-2.12c.328.68.868 1.196 1.53 1.493 1.2.538 2.58.46 3.73-.213a.75.75 0 00.185-1.225c-.218-.218-.387-.492-.52-.803a6.47 6.47 0 01-.433-1.637c-.126-.973-.082-2.03.11-3.085.096-.528.24-1.04.427-1.517.187-.478.432-.916.713-1.286z" clipRule="evenodd" /></svg>
                  {stats.dailyStreak} Day Streak
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
