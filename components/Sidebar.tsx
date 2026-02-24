
import React from 'react';
import { LearningCategory, StudentProfile } from '../types';

interface SidebarProps {
  category: LearningCategory;
  onToggleCategory: (cat: LearningCategory) => void;
  view: string;
  setView: (view: string) => void;
  semester: string;
  onSelectSemester: (sem: string) => void;
  student: StudentProfile | null;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Mobile Props
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  category,
  onToggleCategory,
  view,
  setView,
  semester,
  onSelectSemester,
  student,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const isUpskill = category === LearningCategory.UPSKILL;

  // Navigation Items Configuration
  const academicItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'subject', label: 'Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'planner', label: 'Study Planner', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'progress', label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'revision', label: 'Revision List', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'quizzes', label: 'Quizzes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];

  const upskillItems = [
    { id: 'dashboard', label: 'Skill Dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'paths', label: 'Skill Paths', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { id: 'planner', label: 'My Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'practice', label: 'Practice', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'progress', label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  const globalItems = [
    { id: 'insights', label: 'Learning Insights', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'help', label: 'Help & Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' }
  ];

  const currentItems = isUpskill ? upskillItems : academicItems;

  const handleNavClick = (itemId: string) => {
    if (!isUpskill && itemId === 'subject') {
        if (!semester) {
            alert("Please select a semester first."); 
            return;
        }
        setView('dashboard'); 
    } else if (itemId === 'paths') {
        setView('dashboard'); 
    } else if (itemId === 'practice') {
        // Handle practice navigation properly
        setView('practice');
    } else if (itemId === 'dsa') {
        // Handle DSA navigation
        setView('dsa');
    } else {
        setView(itemId);
    }
    
    // Close sidebar on mobile after selection
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[100] h-full bg-white dark:bg-graphite-surface text-slate-500 dark:text-graphite-text-sub flex flex-col border-r border-slate-200 dark:border-graphite-border shadow-2xl lg:shadow-none transition-transform duration-300 font-sans
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* 1. BRAND IDENTITY */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg relative overflow-hidden group shrink-0 bg-indigo-600 dark:bg-graphite-secondary text-white dark:text-graphite-text-main border dark:border-graphite-border`}>
              <svg className="w-5 h-5 text-white dark:text-graphite-text-main relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isUpskill ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"} />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-slate-900 dark:text-graphite-text-main font-bold text-lg tracking-tight leading-none">StudyAI</h1>
                <p className="text-[9px] font-medium text-slate-400 dark:text-graphite-text-muted mt-1 uppercase tracking-wider">Learning Partner</p>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 2. MODE SWITCH SECTION */}
        <div className={`px-4 mb-6 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="bg-slate-100 dark:bg-graphite-base p-1 rounded-xl flex border border-slate-200 dark:border-graphite-border">
            <button 
              onClick={() => onToggleCategory(LearningCategory.ACADEMIC)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                category === LearningCategory.ACADEMIC 
                  ? 'bg-white dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main shadow-sm' 
                  : 'text-slate-400 dark:text-graphite-text-muted hover:text-slate-700 dark:hover:text-graphite-text-main hover:bg-slate-200 dark:hover:bg-graphite-input'
              }`}
            >
              Academic
            </button>
            <button 
              onClick={() => onToggleCategory(LearningCategory.UPSKILL)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                category === LearningCategory.UPSKILL 
                  ? 'bg-white dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main shadow-sm' 
                  : 'text-slate-400 dark:text-graphite-text-muted hover:text-slate-700 dark:hover:text-graphite-text-main hover:bg-slate-200 dark:hover:bg-graphite-input'
              }`}
            >
              Upskill
            </button>
          </div>
        </div>

        {/* Collapsed Mode Indicator */}
        {isCollapsed && (
          <div className="px-2 mb-6 flex justify-center">
             <button 
               onClick={() => onToggleCategory(isUpskill ? LearningCategory.ACADEMIC : LearningCategory.UPSKILL)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border bg-slate-50 dark:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main border-slate-200 dark:border-graphite-border`}
               title={`Switch to ${isUpskill ? 'Academic' : 'Upskill'} Mode`}
             >
               {isUpskill ? 'UP' : 'AC'}
             </button>
          </div>
        )}

        {/* 3 & 4. NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          
          {/* SEMESTER SELECTOR (Academic Only) */}
          {!isUpskill && !isCollapsed && (
            <div className="mb-6">
              <label className="text-[9px] font-black text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest px-2 mb-2 block">
                Current Semester
              </label>
              <div className="relative">
                <select 
                  value={semester}
                  onChange={(e) => onSelectSemester(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border text-slate-700 dark:text-graphite-text-main text-xs font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub transition-all cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="I">Semester I</option>
                  <option value="V">Semester V</option>
                  <option value="VI">Semester VI</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-graphite-text-muted">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {currentItems.map((item) => {
              const isActive = (view === item.id) || (item.id === 'subject' && view === 'dashboard') || (item.id === 'paths' && view === 'dashboard');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 relative
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main' 
                      : 'text-slate-500 dark:text-graphite-text-sub hover:bg-slate-50 dark:hover:bg-graphite-input hover:text-slate-900 dark:hover:text-graphite-text-main'}
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-600 dark:bg-graphite-action`}></div>
                  )}
                  
                  <svg className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted group-hover:text-slate-600 dark:group-hover:text-graphite-text-main'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  
                  {!isCollapsed && (
                    <span className="text-xs font-bold tracking-wide">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Global Items Separator */}
          <div className="my-4 border-t border-slate-100 dark:border-graphite-border"></div>

          {/* 5. GLOBAL ITEMS */}
           <div className="space-y-1">
            {globalItems.map((item) => {
               const isActive = view === item.id;
               return (
                 <button
                  key={item.id}
                  onClick={() => { setView(item.id); if(window.innerWidth < 1024) onCloseMobile(); }}
                  className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 relative
                     ${isActive ? 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main' : 'text-slate-500 dark:text-graphite-text-sub hover:bg-slate-50 dark:hover:bg-graphite-input hover:text-slate-900 dark:hover:text-graphite-text-main'}
                     ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                 >
                   <svg className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted group-hover:text-slate-600 dark:group-hover:text-graphite-text-main'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                   </svg>
                   {!isCollapsed && <span className="text-xs font-bold tracking-wide">{item.label}</span>}
                 </button>
               )
            })}
           </div>
        </div>

        {/* FOOTER */}
        <div className={`p-4 border-t border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface hidden lg:block`}>
          <button 
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 mb-4 text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main transition-colors"
          >
            <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group ${isCollapsed ? 'justify-center flex-col' : 'hover:bg-slate-50 dark:hover:bg-graphite-input'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white dark:text-graphite-base text-[10px] font-black shrink-0 bg-indigo-600 dark:bg-graphite-action`}>
              {student?.rollNumber.substring(0,2) || 'ST'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[11px] font-bold text-slate-700 dark:text-graphite-text-main group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                  {student?.rollNumber}
                </p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-graphite-success"></div>
                   <p className="text-[9px] font-medium text-slate-400 dark:text-graphite-text-sub truncate">Online</p>
                </div>
              </div>
            )}
            <button 
                onClick={onLogout} 
                className={`p-1.5 text-slate-400 dark:text-graphite-text-muted hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-graphite-secondary ${isCollapsed ? 'mt-1' : ''}`}
                title="Logout"
            >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
