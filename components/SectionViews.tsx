
import React, { useState, useEffect } from 'react';
import { Subject, Topic, TopicStatus, LearningCategory, StudentProfile, StudySession, UserPreferences, DSAProblem, DSAProgress } from '../types';
import JavaCompiler from './JavaCompiler';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import DSAHub from './DSAHub';
import SkillInsightsPage from './SkillInsightsPage';
import PracticeExam from './PracticeExam';
import PerformanceAnalytics from './PerformanceAnalytics'; // NEW IMPORT

interface SectionViewProps {
  view: string;
  category: LearningCategory;
  subjects: Subject[];
  onSelectTopic: (subject: Subject, topic: Topic) => void;
  onStartQuiz: (subject: Subject, unit: any, topic?: Topic) => void;
  onToggleRevision?: (topicId: string) => void; // New prop
  student: StudentProfile;
  sessions: StudySession[];
  onLogout: () => void;
  semester: string;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onNavigate?: (view: string) => void;
}

// Mock Data for Projects
const PROJECTS_DATA = [
  {
    id: 'proj-ecommerce',
    title: 'E-Commerce API',
    level: 'Beginner',
    description: 'Build a scalable backend using Spring Boot and PostgreSQL.',
    scenario: 'You have been hired by a retail startup to build the backbone of their online store. You need to design a RESTful API that handles products, customers, and orders efficiently.',
    stack: ['Java 17', 'Spring Boot', 'H2/PostgreSQL', 'Maven'],
    milestones: [
        'Project Setup & Dependencies',
        'Design Database Schema (Entities)',
        'Implement CRUD Repositories',
        'Build Service Layer Logic',
        'Create REST Controllers',
        'Testing & Documentation'
    ]
  },
  {
    id: 'proj-chat',
    title: 'Real-time Chat App',
    level: 'Advanced',
    description: 'Implement WebSockets and Redis for a high-concurrency messaging system.',
    scenario: 'A social networking client needs a real-time chat feature for their mobile app. Low latency and scalability are critical requirements for this module.',
    stack: ['Java', 'Spring Boot', 'WebSockets (STOMP)', 'Redis', 'React (Frontend)'],
    milestones: [
        'WebSocket Configuration',
        'Redis Pub/Sub Setup',
        'Message Handling Controller',
        'User Session Management',
        'Frontend Client Integration',
        'Load Testing'
    ]
  }
];

const SectionViews: React.FC<SectionViewProps> = ({ 
  view, category, subjects, onSelectTopic, onStartQuiz, onToggleRevision,
  student, sessions, onLogout, semester, preferences, onUpdatePreferences, onNavigate
}) => {
  const isUpskill = category === LearningCategory.UPSKILL;
  
  // State for Generic Practice Mode (Playground vs Exam)
  const [practiceMode, setPracticeMode] = useState<'MENU' | 'PLAYGROUND' | 'EXAM'>('MENU');

  // State for Projects View
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectStatuses, setProjectStatuses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('study_ai_project_status');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  // State for DSA Section (Dedicated)
  const [dsaProgress, setDsaProgress] = useState<DSAProgress>(() => {
    try {
        const saved = localStorage.getItem('study_ai_dsa_progress');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
  });
  const [activeDSAProblem, setActiveDSAProblem] = useState<DSAProblem | null>(null);
  // View mode within DSA section: 'hub' (list) or 'problem' (solver)
  const [dsaInternalMode, setDsaInternalMode] = useState<'hub' | 'problem'>('hub');

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
  };

  const handleStartImplementation = (id: string) => {
    setIsProjectLoading(true);
    // Simulate initialization delay
    setTimeout(() => {
        const newStatuses = { ...projectStatuses, [id]: 'In Progress' };
        setProjectStatuses(newStatuses);
        localStorage.setItem('study_ai_project_status', JSON.stringify(newStatuses));
        setIsProjectLoading(false);
    }, 1500);
  };
  
  // Local state for Project Compiler specifically
  const [showProjectCompiler, setShowProjectCompiler] = useState(false);

  const handleDSASolve = (problemId: string) => {
      const newProgress = { 
          ...dsaProgress, 
          [problemId]: { 
              status: 'Solved' as const, 
              timestamp: Date.now() 
          } 
      };
      setDsaProgress(newProgress);
      localStorage.setItem('study_ai_dsa_progress', JSON.stringify(newProgress));
  };

  // INSIGHTS VIEW (NEW FEATURE)
  if (view === 'insights') {
      return <SkillInsightsPage student={student} onNavigate={onNavigate} />;
  }

  // REVISION LIST VIEW
  if (view === 'revision') {
    const revisionTopics: { subject: Subject; topic: Topic }[] = [];
    subjects.forEach(sub => {
      sub.units.forEach(unit => {
        unit.topics.forEach(topic => {
          if (topic.status === 'Needs Revision' || topic.isHistoricalWeakness) {
            revisionTopics.push({ subject: sub, topic });
          }
        });
      });
    });

    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main mb-6 flex items-center gap-3">
          <span className="p-2 bg-indigo-100 dark:bg-graphite-secondary text-indigo-600 dark:text-graphite-text-sub rounded-xl">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </span>
          Revision Focus
        </h2>
        {revisionTopics.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-graphite-surface rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm">
             <p className="text-slate-400 dark:text-graphite-text-muted font-bold">No topics marked for revision. Keep up the great work!</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {revisionTopics.map(({ subject, topic }) => (
              <div key={topic.id} className="bg-white dark:bg-graphite-surface p-6 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-sm hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-all flex justify-between items-center group">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-1">{subject.name}</div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-graphite-text-main">{topic.name}</h3>
                 </div>
                 <div className="flex gap-2">
                    {onToggleRevision && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleRevision(topic.id); }}
                            className="p-2 text-slate-400 dark:text-graphite-text-muted hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-graphite-secondary rounded-xl transition-all"
                            title="Mark as Done / Remove"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    )}
                    <button onClick={() => onSelectTopic(subject, topic)} className="px-6 py-2 bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main text-xs font-black uppercase tracking-widest rounded-xl group-hover:bg-indigo-600 dark:group-hover:bg-graphite-action group-hover:text-white dark:group-hover:text-graphite-base transition-all">
                        Review Now
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // PROGRESS VIEW - NOW USING NEW PERFORMANCE ANALYTICS
  if (view === 'progress') {
    return (
      <PerformanceAnalytics 
        subjects={subjects} 
        student={student} 
        sessions={sessions} 
      />
    );
  }

  // QUIZZES VIEW (Academic)
  if (view === 'quizzes') {
    return (
       <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
         <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main mb-8">Assessment Center</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map(sub => (
               <div key={sub.id} className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-all">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-graphite-text-main mb-4">{sub.name}</h3>
                  <div className="space-y-3">
                     {sub.units.map(unit => (
                        <div key={unit.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-graphite-secondary rounded-xl">
                           <span className="text-xs font-bold text-slate-600 dark:text-graphite-text-sub">Module {unit.number}: {unit.title.substring(0, 20)}...</span>
                           <button onClick={() => onStartQuiz(sub, unit)} className="px-3 py-1.5 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-700 dark:hover:bg-white transition-colors">
                             Take Quiz
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
       </div>
    );
  }

  // GENERIC PRACTICE VIEW (Simple Playground)
  if (view === 'practice') {
    if (practiceMode === 'PLAYGROUND') {
        return <JavaCompiler onBack={() => setPracticeMode('MENU')} />;
    }

    if (practiceMode === 'EXAM') {
        return <PracticeExam onClose={() => setPracticeMode('MENU')} />;
    }

    // Practice Menu
    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 h-full flex flex-col justify-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main mb-8 text-center">Practice Arena</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
           
           {/* Card 1: Playground */}
           <div 
             onClick={() => setPracticeMode('PLAYGROUND')}
             className="bg-white dark:bg-graphite-surface p-10 rounded-[2.5rem] border border-slate-200 dark:border-graphite-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center"
           >
              <div className="w-24 h-24 bg-indigo-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-6 text-indigo-600 dark:text-graphite-text-main group-hover:scale-110 transition-transform">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main mb-3">Free Playground</h3>
              <p className="text-slate-500 dark:text-graphite-text-sub text-sm font-medium leading-relaxed mb-6">
                Open-ended coding environment. Experiment with algorithms, data structures, and custom test cases without limits.
              </p>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4">Launch Editor &rarr;</span>
           </div>

           {/* Card 2: Exam Mode */}
           <div 
             onClick={() => setPracticeMode('EXAM')}
             className="bg-slate-900 dark:bg-graphite-secondary p-10 rounded-[2.5rem] border border-slate-800 dark:border-graphite-border shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
           >
              {/* Decorative BG */}
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>

              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform relative z-10">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 relative z-10">Practice Exam</h3>
              <p className="text-slate-300 dark:text-graphite-text-muted text-sm font-medium leading-relaxed mb-6 relative z-10">
                Simulate a real interview or exam. Timed questions, randomized topics, and performance analysis.
              </p>
              <span className="text-white font-bold text-xs uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4 relative z-10">Start Assessment &rarr;</span>
           </div>

        </div>
      </div>
    );
  }

  // DSA DEDICATED VIEW
  if (view === 'dsa') {
      if (dsaInternalMode === 'problem' && activeDSAProblem) {
          return (
              <JavaCompiler 
                  problem={activeDSAProblem}
                  onBack={() => setDsaInternalMode('hub')}
                  onSolve={() => handleDSASolve(activeDSAProblem.id)}
              />
          );
      }

      return (
        <DSAHub 
          onSelectProblem={(p) => { setActiveDSAProblem(p); setDsaInternalMode('problem'); }} 
          onBack={() => {
             if (onNavigate) onNavigate('dashboard');
          }}
          progress={dsaProgress}
        />
      );
  }

  // PROJECTS VIEW (Upskill)
  if (view === 'projects') {
    if (showProjectCompiler) {
        return <JavaCompiler onBack={() => setShowProjectCompiler(false)} />;
    }

    if (activeProjectId) {
      const project = PROJECTS_DATA.find(p => p.id === activeProjectId)!;
      const status = projectStatuses[project.id] || 'Not Started';
      const isStarted = status === 'In Progress' || status === 'Completed';

      return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
           {/* Project Header */}
           <div className="flex flex-col items-start gap-4 mb-8">
              <button 
                onClick={() => setActiveProjectId(null)} 
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-graphite-text-muted dark:hover:text-graphite-text-main transition-colors mb-2"
              >
                 <div className="p-1 rounded-full bg-white dark:bg-graphite-surface border border-slate-200 dark:border-graphite-border hover:bg-slate-50 dark:hover:bg-graphite-secondary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                 </div>
                 Back to Projects
              </button>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${project.level === 'Beginner' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{project.level}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isStarted ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>{status}</span>
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">{project.title}</h2>
              </div>
           </div>

           <div className="grid md:grid-cols-3 gap-8 flex-1 overflow-hidden">
              {/* Left Col: Context */}
              <div className="md:col-span-2 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                 <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4">Project Scenario</h3>
                    <p className="text-slate-700 dark:text-graphite-text-main text-lg font-medium leading-relaxed">
                       {project.scenario}
                    </p>
                 </div>

                 <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                       {project.stack.map(tech => (
                          <span key={tech} className="px-4 py-2 bg-slate-50 dark:bg-graphite-secondary border border-slate-200 dark:border-graphite-border rounded-xl text-xs font-bold text-slate-600 dark:text-graphite-text-sub">
                             {tech}
                          </span>
                       ))}
                    </div>
                 </div>
                 
                 <div className="p-6 bg-indigo-50 dark:bg-graphite-secondary rounded-[2rem] border border-indigo-100 dark:border-graphite-border flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-graphite-base rounded-full flex items-center justify-center text-indigo-600 dark:text-graphite-text-main shadow-sm shrink-0">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-indigo-900 dark:text-graphite-text-main">Ready to build?</h4>
                       <p className="text-xs text-indigo-700 dark:text-graphite-text-sub mt-1">Start the project to access the guided workspace and codebase.</p>
                    </div>
                    <button 
                       onClick={() => {
                           handleStartImplementation(project.id);
                           setTimeout(() => setShowProjectCompiler(true), 1600); // Wait for loading simulation
                       }}
                       disabled={isProjectLoading}
                       className="px-6 py-3 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 dark:hover:bg-white transition-all whitespace-nowrap flex items-center gap-2"
                    >
                       {isProjectLoading ? (
                          <>Initializing...</>
                       ) : isStarted ? (
                          <>Open Workspace <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                       ) : (
                          <>Start Project <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                       )}
                    </button>
                 </div>
              </div>

              {/* Right Col: Milestones */}
              <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm h-full overflow-y-auto custom-scrollbar">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-6">Development Plan</h3>
                 <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-graphite-border">
                    {project.milestones.map((step, idx) => (
                       <div key={idx} className="relative pl-8">
                          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white dark:bg-graphite-surface z-10
                             ${isStarted ? 'border-indigo-600 dark:border-graphite-action text-indigo-600 dark:text-graphite-action' : 'border-slate-300 dark:border-graphite-text-muted text-slate-300 dark:text-graphite-text-muted'}
                          `}>
                             <span className="text-[9px] font-black">{idx + 1}</span>
                          </div>
                          <p className={`text-sm font-bold ${isStarted ? 'text-slate-800 dark:text-graphite-text-main' : 'text-slate-400 dark:text-graphite-text-muted'}`}>{step}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main mb-8">Capstone Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
           {PROJECTS_DATA.map((project) => {
             const status = projectStatuses[project.id] || 'Not Started';
             const isStarted = status !== 'Not Started';
             
             return (
               <div key={project.id} className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm hover:border-indigo-300 dark:hover:border-graphite-text-sub transition-all flex flex-col h-full">
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mr-2
                       ${project.level === 'Beginner' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'}
                    `}>{project.level}</span>
                    {isStarted && <span className="px-3 py-1 bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main rounded-lg text-[10px] font-black uppercase tracking-widest inline-block border border-indigo-100 dark:border-graphite-border">In Progress</span>}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-2">{project.title}</h3>
                  <p className="text-slate-500 dark:text-graphite-text-sub text-sm mb-6 flex-1 leading-relaxed">{project.description}</p>
                  
                  <button 
                    onClick={() => handleOpenProject(project.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                       ${isStarted 
                         ? 'bg-white dark:bg-graphite-surface border-2 border-indigo-600 dark:border-graphite-action text-indigo-600 dark:text-graphite-text-main hover:bg-indigo-50 dark:hover:bg-graphite-secondary' 
                         : 'bg-slate-900 dark:bg-graphite-action text-white dark:text-graphite-base hover:bg-slate-800 dark:hover:bg-white'}
                    `}
                  >
                    {isStarted ? 'Continue Project' : 'Start Project'}
                  </button>
               </div>
             );
           })}
        </div>
      </div>
    );
  }
  
  // PROFILE VIEW
  if (view === 'profile') {
      return (
        <ProfilePage 
          student={student} 
          sessions={sessions} 
          onLogout={onLogout} 
          currentSemester={semester} 
          preferences={preferences}
          onUpdatePreferences={onUpdatePreferences}
        />
      );
  }

  // SETTINGS VIEW
  if (view === 'settings') {
    return (
       <SettingsPage 
         preferences={preferences} 
         onUpdatePreferences={onUpdatePreferences} 
         onLogout={onLogout} 
         lastLoginTime={student.memory.lastActiveSession}
       />
    );
  }

  // HELP VIEW
  if (view === 'help') {
    return (
        <div className="flex h-full items-center justify-center p-10">
           <div className="text-center">
             <h2 className="text-2xl font-black text-slate-300 dark:text-graphite-text-muted uppercase tracking-widest mb-4">Help & Support</h2>
             <p className="text-slate-500 dark:text-graphite-text-sub font-medium">This module is currently under development.</p>
           </div>
        </div>
    );
  }

  // FALLBACK UI - CRITICAL FIX FOR BLANK SCREEN
  return (
    <div className="flex h-full items-center justify-center p-10 animate-in fade-in duration-500">
        <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-slate-100 dark:bg-graphite-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-400 dark:text-graphite-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-graphite-text-main mb-2">View Not Found</h3>
            <p className="text-slate-500 dark:text-graphite-text-sub mb-6">The requested section "{view}" could not be loaded or doesn't exist.</p>
            <button 
                onClick={() => onNavigate && onNavigate('dashboard')} 
                className="px-6 py-2 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-xl font-bold text-xs uppercase tracking-widest"
            >
                Return to Dashboard
            </button>
        </div>
    </div>
  );
};

export default SectionViews;
