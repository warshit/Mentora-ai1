
// ... existing imports
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SubjectPage from './components/SubjectPage';
import TopicStudyPage from './components/TopicStudyPage';
import QuizInterface from './components/QuizInterface';
import { LoadingOverlay, ChatMessageSkeleton } from './components/LoadingState';
import CelebrationOverlay from './components/CelebrationOverlay';
import PomodoroTimer from './components/PomodoroTimer';
import SyllabusModal from './components/SyllabusModal';
import ScheduleGeneratorModal from './components/ScheduleGeneratorModal';
import UpskillDashboard from './components/UpskillDashboard';
import SkillPathPage from './components/SkillPathPage';
import SectionViews from './components/SectionViews';
import StudyPlanner from './components/StudyPlanner'; // NEW IMPORT
import { getGeminiResponse, generateTopicStudyContent, generateQuiz, generateStructuredSchedule } from './services/geminiService'; // Updated import
import { Message, StudySession, LearningMode, StudentProfile, Subject, Topic, TopicStatus, LearningCategory, ExplanationStyle, StudyPlan, DoubtType, QuizConfig, Unit, TopicStudyContent, UserPreferences, ScheduleConfig, SkillDataPoint, StudySchedule } from './types';
import { INITIAL_GREETING, MOCK_CURRICULUM } from './constants';

// Safe Storage Helper - Defined in module scope to prevent re-creation
function getSafeStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Storage Error (${key}):`, e);
    return fallback;
  }
}

const App: React.FC = () => {
  // ... existing state definitions
  const [isMounted, setIsMounted] = useState(false);
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    // ... existing profile loading logic
    try {
        const saved = getSafeStorage('study_ai_student_profile', null);
        if (saved) {
            const s = saved as any;
            if (!s.memory) s.memory = { historicalWeakTopics: [], completedCredits: 0 };
            if (!s.memory.historicalWeakTopics) s.memory.historicalWeakTopics = [];
            if (!s.topicNotes) s.topicNotes = {};
            if (!s.skillHistory) s.skillHistory = []; // Initialize skill history
            if (!s.preferences) {
               s.preferences = {
                  theme: 'light', 
                  defaultMode: LearningCategory.ACADEMIC,
                  explanationStyle: ExplanationStyle.COMPANION,
                  notifications: { quizReminders: true, revisionReminders: true },
                  textSize: 'medium'
               };
            }
            if (!s.productivity) {
                s.productivity = {
                    totalFocusMinutes: 0,
                    sessionsCompleted: 0,
                    dailyStreak: 0,
                    lastSessionDate: '',
                    todaySessions: 0
                };
            }
            if (!s.pomodoroSettings) {
                s.pomodoroSettings = {
                    focusDuration: 25,
                    shortBreakDuration: 5,
                    longBreakDuration: 15,
                    autoStartBreak: false,
                    soundEnabled: true
                };
            }
            return s as StudentProfile;
        }
    } catch (e) {
        console.error("Critical Profile Load Error:", e);
    }
    return null;
  });

  const [view, setView] = useState<string>(() => {
    const saved = getSafeStorage<string>('study_ai_view', 'dashboard');
    // Sanitize view on load
    if (['quiz', 'topic_study'].includes(saved)) return 'dashboard';
    return (saved as string) || 'dashboard';
  });

  // ... rest of state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [celebration, setCelebration] = useState<'TOPIC_COMPLETE' | 'PERFECT_SCORE' | null>(null);
  
  const [category, setCategory] = useState<LearningCategory>(() => {
    const saved = getSafeStorage('study_ai_last_category', null);
    if (saved && Object.values(LearningCategory).includes(saved as LearningCategory)) {
      return saved as LearningCategory;
    }
    return student?.preferences?.defaultMode || LearningCategory.ACADEMIC;
  });

  const [style, setStyle] = useState<ExplanationStyle>(student?.preferences?.explanationStyle || ExplanationStyle.COMPANION);

  const [selectedSemester, setSelectedSemester] = useState<string>('V');
  
  // FIX: Initialize selectedSubjectId from storage to prevent lost context on refresh
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
      return getSafeStorage('study_ai_selected_subject', '');
  });

  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [activeQuizTopicId, setActiveQuizTopicId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<{subject: Subject, unit: Unit, topic: Topic} | null>(null);
  const [topicContentCache, setTopicContentCache] = useState<Record<string, TopicStudyContent>>({});
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [sessions, setSessions] = useState<StudySession[]>(() => getSafeStorage('study_ai_sessions', []));

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('study_ai_current_session_id') || '';
    }
    return '';
  });

  const [curriculum, setCurriculum] = useState<Subject[]>([]);
  
  // REPLACED: Old studyPlan text state with Structured Schedule State
  const [studySchedule, setStudySchedule] = useState<StudySchedule | null>(() => getSafeStorage('study_ai_schedule', null));

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const perfectScoresSession = useRef<Set<string>>(new Set());

  // ... Modals state
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customSyllabus, setCustomSyllabus] = useState<Subject[] | null>(() => getSafeStorage('study_ai_custom_syllabus', null));

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: 'SUBJECT' | 'TOPIC', title: string, subtitle: string, data: any }[]>([]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    curriculum.forEach(sub => {
      // Check Subject Name or Code
      if (sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)) {
        results.push({ 
          type: 'SUBJECT', 
          title: sub.name, 
          subtitle: `Subject • ${sub.code}`, 
          data: sub 
        });
      }
      // Check Topics
      sub.units.forEach(unit => {
        unit.topics.forEach(topic => {
          if (topic.name.toLowerCase().includes(q)) {
            results.push({ 
              type: 'TOPIC', 
              title: topic.name, 
              subtitle: `Topic • ${sub.code} • Unit ${unit.number}`, 
              data: { subject: sub, topic } 
            });
          }
        });
      });
    });
    // Limit results for UI
    setSearchResults(results.slice(0, 8));
  }, [searchQuery, curriculum]);

  // ... Persistence helpers
  const saveProgress = (subjects: Subject[]) => {
    try {
        const progressMap: Record<string, TopicStatus> = {};
        subjects.forEach(s => s.units.forEach(u => u.topics.forEach(t => {
            if (t.status !== 'Not Started') {
                progressMap[t.id] = t.status;
            }
        })));
        localStorage.setItem('study_ai_progress', JSON.stringify(progressMap));
    } catch (e) {
        console.warn("Failed to save progress", e);
    }
  };

  const getSavedProgress = () => {
      try {
          const saved = localStorage.getItem('study_ai_progress');
          return saved ? JSON.parse(saved) : {};
      } catch (e) {
          return {};
      }
  };

  // ... Profile update handlers
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
     if (!student) return;
     const updatedStudent = { ...student, preferences: newPrefs };
     setStudent(updatedStudent);
     try {
         const db = JSON.parse(localStorage.getItem('study_ai_users_db') || '{}');
         if (db[student.rollNumber]) {
            db[student.rollNumber].profile = updatedStudent;
            localStorage.setItem('study_ai_users_db', JSON.stringify(db));
         }
     } catch(e) {
         console.error("Failed to sync preferences", e);
     }
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
      setStudent(newProfile);
      try {
          const db = JSON.parse(localStorage.getItem('study_ai_users_db') || '{}');
          if (db[student?.rollNumber || '']) {
             db[student!.rollNumber].profile = newProfile;
             localStorage.setItem('study_ai_users_db', JSON.stringify(db));
          }
      } catch(e) {
          console.error("Failed to sync profile", e);
      }
  };

  // ... Effects
  useEffect(() => {
    setIsMounted(true);
    try {
        if (student?.preferences?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
    } catch(e) {
        document.documentElement.classList.remove('dark');
    }
  }, [student?.preferences?.theme]);

  useEffect(() => {
     if (student?.preferences) {
        setStyle(student.preferences.explanationStyle);
     }
  }, [student?.preferences?.explanationStyle]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('study_ai_last_category', category);
  }, [category]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (student) {
        localStorage.setItem('study_ai_student_profile', JSON.stringify(student));
      } else {
        localStorage.removeItem('study_ai_student_profile');
      }
    }
  }, [student]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('study_ai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // NEW: Persist Schedule
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('study_ai_schedule', JSON.stringify(studySchedule));
  }, [studySchedule]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('study_ai_current_session_id', currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    // Persist view state only if valid
    if (typeof window !== 'undefined') {
        localStorage.setItem('study_ai_view', view);
    }
  }, [view]);

  // FIX: Persist selectedSubjectId
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('study_ai_selected_subject', selectedSubjectId);
    }
  }, [selectedSubjectId]);

  // FIX: View Integrity Check
  useEffect(() => {
    // If we are in 'subject' view but no subject is selected, go to dashboard
    if (view === 'subject' && !selectedSubjectId) {
        setView('dashboard');
    }
    // If we are in topic_study but no topic is active, fallback
    if (view === 'topic_study' && !activeTopic) {
        // Try to fall back to subject if possible
        if (selectedSubjectId) setView('subject');
        else setView('dashboard');
    }
  }, [view, selectedSubjectId, activeTopic]);

  useEffect(() => {
    if (student) {
      let targetData: Subject[] = [];

      try {
          if (category === LearningCategory.UPSKILL) {
             targetData = MOCK_CURRICULUM["UPSKILL"] || [];
          } else {
             if (customSyllabus && customSyllabus.length > 0) {
                targetData = customSyllabus;
             } else {
                targetData = MOCK_CURRICULUM[student.department] || MOCK_CURRICULUM["CSE"] || [];
             }
             
             if (selectedSemester && targetData.length > 0 && !customSyllabus) {
                targetData = targetData.filter(sub => sub.semester === selectedSemester);
             }
          }

          const progress = getSavedProgress();
          const enrichedData = targetData.map(sub => ({
            ...sub,
            units: sub.units.map(unit => ({
                ...unit,
                topics: unit.topics.map(t => ({
                    ...t,
                    status: progress[t.id] || t.status,
                    isHistoricalWeakness: (student.memory?.historicalWeakTopics?.includes(t.name)) || t.isHistoricalWeakness
                }))
            }))
          }));

          setCurriculum(enrichedData);
      } catch (e) {
          console.error("Curriculum Load Error:", e);
          setCurriculum([]); 
      }
    }
  }, [student?.department, category, selectedSemester, customSyllabus]);

  // ... Scroll & Active Topic Effects
  useEffect(() => {
    if (scrollRef.current) {
      try {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          }, 100);
      } catch (e) { /* Ignore scroll error */ }
    }
  }, [sessions, currentSessionId, isLoading, view]);

  useEffect(() => {
    if (activeTopic && curriculum.length > 0) {
      const updatedSubject = curriculum.find(s => s.id === activeTopic.subject.id);
      if (updatedSubject) {
        const updatedUnit = updatedSubject.units.find(u => u.id === activeTopic.unit.id);
        if (updatedUnit) {
          const updatedTopic = updatedUnit.topics.find(t => t.id === activeTopic.topic.id);
          if (updatedTopic) {
            setActiveTopic(prev => prev ? { ...prev, subject: updatedSubject, unit: updatedUnit, topic: updatedTopic } : null);
          }
        }
      }
    }
  }, [curriculum]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleSubjectSelection = (subjectId: string) => {
    // FIX: Intercept special practice/DSA subject ID
    if (subjectId === 'practice') {
        setView('practice');
        setSelectedSubjectId('');
        return;
    }
    
    // NEW: Intercept DSA subject ID to route to dedicated DSA view
    if (subjectId === 'dsa') {
        setView('dsa');
        setSelectedSubjectId('');
        return;
    }

    setSelectedSubjectId(subjectId);
    if (subjectId) {
      setView('subject');
    } else {
      setView('dashboard');
    }
  };

  const handleGlobalBack = () => {
    if (view === 'topic_study') {
        setView('subject');
    } else if (view === 'quiz') {
        if (activeQuizTopicId && activeTopic && activeTopic.topic.id === activeQuizTopicId) {
            setView('topic_study');
        } else {
            setView('subject');
        }
    } else {
        setView('dashboard');
        setSelectedSubjectId('');
    }
  };

  // --- REVISION LIST TOGGLE HANDLER (CRITICAL FIX) ---
  const handleToggleRevision = (topicId: string) => {
    setCurriculum(prev => {
        const newData = prev.map(sub => ({
            ...sub,
            units: sub.units.map(unit => ({
                ...unit,
                topics: unit.topics.map(t => {
                    if (t.id === topicId) {
                        const isCurrentlyFlagged = t.status === 'Needs Revision' || t.isHistoricalWeakness;
                        const wasCompleted = t.status === 'Completed'; // Capture before change
                        
                        if (isCurrentlyFlagged) {
                            // Removing from Revision
                            // If status was 'Needs Revision', we revert to 'In Progress' or 'Completed' if we knew it? 
                            // Without history, 'In Progress' is safe.
                            const newStatus = t.status === 'Needs Revision' ? 'In Progress' : t.status;
                            return { ...t, status: newStatus, isHistoricalWeakness: false };
                        } else {
                            // Adding to Revision
                            // We set status to 'Needs Revision'. 
                            // IMPORTANT: We also set isHistoricalWeakness=true to make it "sticky" in the revision list
                            return { ...t, status: 'Needs Revision', isHistoricalWeakness: true };
                        }
                    }
                    return t;
                })
            }))
        }));
        saveProgress(newData); // Persist immediately
        return newData;
    });
    
    // Provide instant visual feedback via toast
    // We determine the action based on current state (before the update propagates, 
    // but React batching makes accessing current state tricky inside the setter. 
    // We can infer or just show a neutral "Revision List Updated" message, 
    // or calculate it separately.
    const isAdding = !curriculum.some(s => s.units.some(u => u.topics.some(t => t.id === topicId && (t.status === 'Needs Revision' || t.isHistoricalWeakness))));
    showToast(isAdding ? "Added to Revision List" : "Removed from Revision List");
  };

  // ... handleUpdateTopicStatus, handleCreateNewSession, etc.
  const handleUpdateTopicStatus = (topicId: string, status: TopicStatus) => {
    if (status === 'Completed') {
       let previousStatus: TopicStatus | undefined;
       for (const sub of curriculum) {
         for (const unit of sub.units) {
           const t = unit.topics.find(t => t.id === topicId);
           if (t) {
             previousStatus = t.status;
             break;
           }
         }
         if (previousStatus) break;
       }
       if (previousStatus && previousStatus !== 'Completed') {
          setCelebration('TOPIC_COMPLETE');
       }
    }

    const updatedCurriculum = curriculum.map(subj => ({
      ...subj,
      units: subj.units.map(unit => ({
        ...unit,
        topics: unit.topics.map(t => {
            if (t.id === topicId) {
                // If explicitly setting 'Needs Revision', assume weakness
                const isWeak = status === 'Needs Revision' ? true : t.isHistoricalWeakness;
                return { ...t, status, isHistoricalWeakness: isWeak };
            }
            return t;
        })
      }))
    }));

    setCurriculum(updatedCurriculum);
    saveProgress(updatedCurriculum);
    showToast(`Topic status updated to ${status}`);

    if (status === 'Needs Revision' && student) {
      const topic = curriculum.flatMap(s => s.units.flatMap(u => u.topics)).find(t => t.id === topicId);
      if (topic && !student.memory.historicalWeakTopics.includes(topic.name)) {
        setStudent({
          ...student,
          memory: {
            ...student.memory,
            historicalWeakTopics: [...student.memory.historicalWeakTopics, topic.name]
          },
          topicNotes: student.topicNotes,
          preferences: student.preferences
        });
      }
    }
  };

  const handleCreateNewSession = () => {
    const id = `session-${Date.now()}`;
    const newSession: StudySession = {
      id,
      title: 'New Connection',
      category: category,
      messages: [
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: `Initialized fresh **${category}** node. I am ready to facilitate your learning journey. Please ensure your **Subject Selection** is set correctly above.`,
          timestamp: Date.now()
        }
      ],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
    setView('chat');
  };

  const handleStartTopicStudy = async (subject: Subject, topic: Topic) => {
    const unit = subject.units.find(u => u.topics.some(t => t.id === topic.id));
    if (!unit) return;

    setActiveTopic({ subject, unit, topic });
    setSelectedSubjectId(subject.id); // Ensures redundancy for back navigation
    setView('topic_study');

    const sessionId = `study-${topic.id}-${category}`;
    const existingSession = sessions.find(s => s.id === sessionId);
    
    if (!existingSession) {
      const newSession: StudySession = {
        id: sessionId,
        title: topic.name,
        subjectId: subject.id,
        topicId: topic.id,
        category: category,
        messages: [
          {
            id: 'system-intro',
            role: 'assistant',
            content: `I'm ready to answer any questions about **${topic.name}**. What would you like to clarify?`,
            timestamp: Date.now()
          }
        ],
        lastUpdated: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
    }
    setCurrentSessionId(sessionId);

    if (topicContentCache[topic.id]) {
        return;
    }

    setIsTopicLoading(true);
    const content = await generateTopicStudyContent(
        subject.code,
        subject.name,
        unit.title,
        topic.name,
        subject.semester || "V"
    );

    if (content) {
        setTopicContentCache(prev => ({ ...prev, [topic.id]: content }));
    } else {
        showToast("Failed to load topic content. Please try again.");
    }
    setIsTopicLoading(false);
    
    if (topic.status === 'Not Started') {
       handleUpdateTopicStatus(topic.id, 'In Progress');
    }
  };

  const handleRefreshTopicContent = async (action: string) => {
  };

  const handleSaveNotes = (notes: string) => {
      if (!student || !activeTopic) return;
      const newStudent = {
          ...student,
          topicNotes: {
              ...student.topicNotes,
              [activeTopic.topic.id]: notes
          }
      };
      setStudent(newStudent);
  };

  const handleStartQuiz = async (subject: Subject, unit: Unit, topic?: Topic) => {
    setIsLoading(true);
    
    if (topic) {
      setActiveQuizTopicId(topic.id);
    } else {
      setActiveQuizTopicId(null);
    }

    const questions = await generateQuiz(
      subject.code, 
      subject.name, 
      unit.title, 
      topic ? topic.name : null, 
      !topic
    );

    if (questions && questions.length > 0) {
      setQuizConfig({
        title: topic ? `Topic Quiz: ${topic.name}` : `Module Quiz: ${unit.title}`,
        type: topic ? 'TOPIC' : 'MODULE',
        questions: questions,
        subjectId: subject.id // Added for skill tracking
      });
      setView('quiz');
    } else {
      showToast("Failed to generate quiz. Please try again.");
    }
    setIsLoading(false);
  };

  const handleQuizCompletion = (score: number, total: number) => {
    if (activeQuizTopicId && quizConfig?.type === 'TOPIC') {
      const percentage = (score / total) * 100;
      
      // 1. CELEBRATION
      if (percentage === 100 && !perfectScoresSession.current.has(activeQuizTopicId)) {
         setCelebration('PERFECT_SCORE');
         perfectScoresSession.current.add(activeQuizTopicId);
      }

      // 2. STATUS UPDATE
      const newStatus: TopicStatus = percentage >= 70 ? 'Completed' : 'Needs Revision';
      handleUpdateTopicStatus(activeQuizTopicId, newStatus);

      // 3. SKILL HISTORY LOG (Additive Feature)
      if (student) {
        const newDataPoint: SkillDataPoint = {
            date: new Date().toISOString(),
            score: percentage,
            topicId: activeQuizTopicId,
            topicName: quizConfig.title // Rough approximation
        };
        
        setStudent(prev => {
            if (!prev) return null;
            const history = prev.skillHistory ? [...prev.skillHistory, newDataPoint] : [newDataPoint];
            return { ...prev, skillHistory: history };
        });
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customInput?: string, activeMode: 'CONCEPT' | 'EXAM' = 'CONCEPT') => {
    e?.preventDefault();
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: Date.now() };
    const currentSession = sessions.find(s => s.id === currentSessionId);

    setSessions(prev => prev.map(s => s.id === currentSessionId ? {
      ...s,
      messages: [...s.messages, userMessage],
      lastUpdated: Date.now()
    } : s));

    if (!customInput) setInput('');
    setIsLoading(true);

    try {
      const activeSubjectId = selectedSubjectId || currentSession?.subjectId;
      const currentSubject = activeSubjectId 
        ? curriculum.find(s => s.id === activeSubjectId)
        : null;

      const { text, doubtType, mode } = await getGeminiResponse(
        currentSession?.messages || [],
        textToSend,
        student,
        category,
        style,
        selectedSemester,
        currentSubject?.code || '',
        activeMode
      );

      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: text, 
        doubtType: doubtType,
        mode: mode,
        timestamp: Date.now() 
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const newTitle = s.title === 'New Connection' ? (textToSend.length > 30 ? textToSend.substring(0, 30) + '...' : textToSend) : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, assistantMessage],
            lastUpdated: Date.now()
          };
        }
        return s;
      }));

      const ltext = text.toLowerCase();
      if (ltext.includes("revisit") || ltext.includes("prerequisite") || ltext.includes("difficulty")) {
        if (currentSession?.topicId) {
          handleUpdateTopicStatus(currentSession.topicId, 'Needs Revision');
        }
      } else if (ltext.includes("successfully") || ltext.includes("congratulations") || ltext.includes("mastered")) {
         if (currentSession?.topicId) {
          handleUpdateTopicStatus(currentSession.topicId, 'Completed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicPageSendMessage = (text: string, mode: 'CONCEPT' | 'EXAM') => {
    handleSendMessage(undefined, text, mode);
  };

  // ... Syllabus Actions
  const handleImportSyllabus = () => {
    setShowSyllabusModal(true);
  };

  const handleSaveSyllabus = (parsedData: Subject[]) => {
    if (parsedData.length > 0) {
      setCustomSyllabus(parsedData);
      setCurriculum(parsedData);
      localStorage.setItem('study_ai_custom_syllabus', JSON.stringify(parsedData));
      showToast("Syllabus imported and saved.");
    }
  };

  // ... Schedule Actions
  const handleOpenScheduleGenerator = () => {
    setShowScheduleModal(true);
  };

  // NEW: Generate Structured Schedule
  const handleGenerateStudyPlan = async (config: ScheduleConfig) => {
    setIsLoading(true);
    const subjectNames = curriculum.map(s => s.name);
    const weakTopics = student?.memory?.historicalWeakTopics?.join(", ") || "None";
    
    try {
        const tasks = await generateStructuredSchedule(config, subjectNames, weakTopics);
        
        const newSchedule: StudySchedule = {
            id: Date.now().toString(),
            createdAt: Date.now(),
            tasks: tasks,
            config: config
        };

        setStudySchedule(newSchedule);
        setView('planner');
        showToast("Schedule generated successfully!");
    } catch (e) {
        console.error(e);
        showToast("Failed to generate schedule.");
    } finally {
        setIsLoading(false);
    }
  };

  // ... Next Topic Logic
  const findNextTopic = (subject: Subject, currentUnitId: string, currentTopicId: string) => {
    const unitIndex = subject.units.findIndex(u => u.id === currentUnitId);
    if (unitIndex === -1) return null;
    const unit = subject.units[unitIndex];
    const topicIndex = unit.topics.findIndex(t => t.id === currentTopicId);

    if (topicIndex !== -1 && topicIndex + 1 < unit.topics.length) {
      return { unit: unit, topic: unit.topics[topicIndex + 1] };
    }

    if (unitIndex + 1 < subject.units.length) {
      const nextUnit = subject.units[unitIndex + 1];
      if (nextUnit.topics.length > 0) {
        return { unit: nextUnit, topic: nextUnit.topics[0] };
      }
    }
    return null;
  };

  const getNextTopicData = () => {
    if (!activeTopic) return null;
    return findNextTopic(activeTopic.subject, activeTopic.unit.id, activeTopic.topic.id);
  };

  const handleNextTopic = () => {
    const next = getNextTopicData();
    if (next && activeTopic) {
      handleStartTopicStudy(activeTopic.subject, next.topic);
    } else {
      showToast("You have completed this subject! Great job.");
      setView('subject');
    }
  };

  // ... Auth Handlers
  const onLogin = (profile: StudentProfile) => {
    setStudent(profile);
    if (profile.preferences) {
        setCategory(profile.preferences.defaultMode);
    }
    setStudent(prev => prev ? { 
        ...prev, 
        memory: { ...prev.memory, lastActiveSession: Date.now() } 
    } : null);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      setStudent(null);
      // Clean up storage to prevent auto-login on refresh
      if (typeof window !== 'undefined') {
        localStorage.removeItem('study_ai_student_profile');
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-graphite-base">
        <div className="flex flex-col items-center animate-pulse">
           <div className="w-12 h-12 bg-indigo-200 dark:bg-graphite-border rounded-full mb-4"></div>
           <div className="h-4 w-32 bg-slate-200 dark:bg-graphite-border rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) return <Login onLogin={onLogin} />;

  const textSizeClass = student.preferences?.textSize === 'large' ? 'text-lg' : student.preferences?.textSize === 'small' ? 'text-sm' : 'text-base';

  // HELPER: Render the active content view based on state
  const renderActiveView = () => {
    if (view === 'dashboard') {
        return (
            <div className={`h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-graphite-base`}>
              {category === LearningCategory.UPSKILL ? (
                 <UpskillDashboard 
                    subjects={curriculum}
                    onSelectSubject={handleSubjectSelection}
                 />
              ) : (
                <Dashboard 
                  subjects={curriculum} 
                  onSelectTopic={handleStartTopicStudy} 
                  onUpdateStatus={handleUpdateTopicStatus}
                  onImportSyllabus={handleImportSyllabus}
                  onGeneratePlan={handleOpenScheduleGenerator}
                  category={category}
                  onSelectSubject={handleSubjectSelection}
                  hasSyllabus={curriculum.length > 0}
                  onNavigate={setView}
                />
              )}
            </div>
        );
    }

    // NEW: Planner View
    if (view === 'planner') {
        return (
            <div className={`h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-graphite-base`}>
                <StudyPlanner 
                    schedule={studySchedule}
                    onGenerate={handleOpenScheduleGenerator}
                    onUpdateSchedule={(newSchedule) => setStudySchedule(newSchedule)}
                />
            </div>
        );
    }

    if (view === 'subject') {
        const activeSubject = curriculum.find(s => s.id === selectedSubjectId);

        if (!activeSubject) {
            return (
                <div className="flex h-full items-center justify-center p-10 flex-col animate-in fade-in duration-300 bg-slate-50 dark:bg-graphite-base">
                    <p className="text-slate-500 dark:text-graphite-text-muted mb-4 font-medium">Subject not available.</p>
                    <button onClick={() => setView('dashboard')} className="text-indigo-600 dark:text-graphite-text-main font-bold hover:underline">Return to Dashboard</button>
                </div>
            );
        }
        return (
            <div className={`h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-graphite-base`}>
                {category === LearningCategory.UPSKILL ? (
                    <SkillPathPage 
                      subject={activeSubject}
                      onSelectTopic={handleStartTopicStudy}
                      onUpdateStatus={handleUpdateTopicStatus}
                      onStartQuiz={handleStartQuiz}
                      onBack={() => { setView('dashboard'); setSelectedSubjectId(''); }} 
                    />
                ) : (
                    <SubjectPage 
                      subject={activeSubject}
                      onSelectTopic={handleStartTopicStudy}
                      onUpdateStatus={handleUpdateTopicStatus}
                      onToggleRevision={handleToggleRevision} // Pass new handler
                      onStartQuiz={handleStartQuiz}
                      category={category}
                      onBack={() => { setView('dashboard'); setSelectedSubjectId(''); }}
                    />
                )}
            </div>
        );
    }

    if (view === 'topic_study') {
        if (!activeTopic) {
            // Error State / Fallback
            return (
                <div className="flex h-full items-center justify-center p-10 flex-col animate-in fade-in duration-300 bg-slate-50 dark:bg-graphite-base">
                    <p className="text-slate-500 dark:text-graphite-text-muted mb-4 font-medium">Topic content unavailable.</p>
                    <button onClick={() => setView('subject')} className="text-indigo-600 dark:text-graphite-text-main font-bold hover:underline">Back to Subject</button>
                </div>
            );
        }
        
        const activeSession = sessions.find(s => s.id === currentSessionId);

        return (
            <TopicStudyPage 
                subject={activeTopic.subject}
                unit={activeTopic.unit}
                topic={activeTopic.topic}
                semester={selectedSemester}
                category={category}
                content={topicContentCache[activeTopic.topic.id]}
                onBack={() => setView('subject')}
                onStartQuiz={() => handleStartQuiz(activeTopic.subject, activeTopic.unit, activeTopic.topic)}
                isLoading={isTopicLoading}
                onSaveNotes={handleSaveNotes}
                initialNotes={student?.topicNotes?.[activeTopic.topic.id] || ''}
                onRefreshContent={handleRefreshTopicContent}
                messages={activeSession?.messages || []}
                onSendMessage={handleTopicPageSendMessage}
                isChatLoading={isLoading}
                onUpdateStatus={handleUpdateTopicStatus}
                onToggleRevision={handleToggleRevision} // Pass new handler
                nextTopic={getNextTopicData()?.topic}
                onNextTopic={handleNextTopic}
            />
        );
    }

    if (view === 'quiz') {
        if (!quizConfig) {
            return (
                <div className="flex h-full items-center justify-center p-10 flex-col animate-in fade-in duration-300 bg-slate-50 dark:bg-graphite-base">
                    <p className="text-slate-500 dark:text-graphite-text-muted mb-4 font-medium">Quiz configuration missing.</p>
                    <button onClick={() => setView('subject')} className="text-indigo-600 dark:text-graphite-text-main font-bold hover:underline">Back to Subject</button>
                </div>
            );
        }
        return (
            <QuizInterface 
                config={quizConfig}
                onClose={() => {
                    // Navigate back to where the user came from
                    if (activeQuizTopicId && activeTopic && activeTopic.topic.id === activeQuizTopicId) {
                        setView('topic_study');
                    } else {
                        setView('subject');
                    }
                }}
                onRetake={() => {
                     // If we have context, try to regenerate. Otherwise return to subject.
                     if (activeTopic && activeQuizTopicId === activeTopic.topic.id) {
                         handleStartQuiz(activeTopic.subject, activeTopic.unit, activeTopic.topic);
                     } else {
                         setView('subject');
                     }
                }}
                onComplete={handleQuizCompletion}
            />
        );
    }

    // Default Fallback: Delegate to SectionViews for side nav items
    return (
        <div className={`h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-graphite-base`}>
            <SectionViews 
                view={view}
                category={category}
                subjects={curriculum}
                onSelectTopic={handleStartTopicStudy}
                onStartQuiz={handleStartQuiz}
                onToggleRevision={handleToggleRevision} // Pass new handler
                student={student}
                sessions={sessions}
                onLogout={handleLogout}
                semester={selectedSemester}
                preferences={student.preferences!}
                onUpdatePreferences={handleUpdatePreferences}
                onNavigate={setView}
            />
        </div>
    );
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-graphite-base text-slate-800 dark:text-graphite-text-main overflow-hidden ${textSizeClass}`}>
      {/* ... existing layout elements ... */}
      
      {/* Global Loading Overlay */}
      <LoadingOverlay isVisible={isLoading && view !== 'chat' && view !== 'topic_study'} message="Architecting your learning path..." />

      {/* Achievement Celebration */}
      {celebration && (
        <CelebrationOverlay 
          type={celebration} 
          onComplete={() => setCelebration(null)} 
        />
      )}

      {/* Pomodoro Timer */}
      <PomodoroTimer 
        student={student}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Modals */}
      <SyllabusModal 
        isOpen={showSyllabusModal} 
        onClose={() => setShowSyllabusModal(false)} 
        onSave={handleSaveSyllabus} 
      />
      <ScheduleGeneratorModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        onGenerate={handleGenerateStudyPlan}
        hasSyllabus={curriculum.length > 0}
        semester={selectedSemester}
      />

      <Sidebar 
        category={category}
        onToggleCategory={(cat) => { setCategory(cat); setView('dashboard'); setSelectedSubjectId(''); }}
        view={view}
        setView={setView}
        semester={selectedSemester}
        onSelectSemester={setSelectedSemester}
        student={student}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative h-full transition-all duration-300 w-full min-w-0">
        <div className={`h-1 w-full bg-slate-200 dark:bg-graphite-border`}></div>

        {/* Toast */}
        <div className={`fixed top-12 right-8 z-[100] transition-all duration-500 transform ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="bg-white dark:bg-graphite-secondary text-slate-800 dark:text-graphite-text-main px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-slate-200 dark:border-graphite-border">
            <div className={`w-3 h-3 rounded-full animate-pulse bg-indigo-600 dark:bg-graphite-action`}></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{toast.message}</span>
          </div>
        </div>

        {/* Header */}
        <header className={`h-20 border-b border-slate-200 dark:border-graphite-border bg-white/90 dark:bg-graphite-surface/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 shadow-sm z-50 transition-colors`}>
          <div className="flex items-center gap-4 md:gap-6 flex-1">
             <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-graphite-text-sub dark:hover:text-graphite-text-main"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>

             {/* Global Back Button */}
             {view !== 'dashboard' && (
                <button 
                  onClick={handleGlobalBack}
                  className="p-2 md:p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-muted transition-all"
                  title="Back"
                >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
             )}

             <button onClick={() => { setView('dashboard'); setSelectedSubjectId(''); }} className={`p-2 md:p-3 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-graphite-secondary text-slate-500 dark:text-graphite-text-muted'}`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 01 1v4a1 1 0 001 1m-6 0h6"/></svg>
             </button>
             
             {category === LearningCategory.ACADEMIC ? (
               <div className="flex items-center gap-3">
                 <div className="relative group md:min-w-[250px] w-full max-w-[200px] md:max-w-none">
                   <select 
                     value={selectedSubjectId}
                     onChange={(e) => handleSubjectSelection(e.target.value)}
                     className={`w-full appearance-none border text-xs font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-graphite-text-sub transition-all uppercase tracking-wider truncate
                       bg-white dark:bg-graphite-secondary border-slate-200 dark:border-graphite-border text-slate-800 dark:text-graphite-text-main
                     `}
                   >
                     <option value="">Select Subject (Required)</option>
                     {curriculum.map(sub => (
                       <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                     ))}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-graphite-text-muted">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                   </div>
                 </div>
               </div>
             ) : (
                <div className="flex items-center gap-2">
                   <div className={`px-3 py-1 bg-amber-50 dark:bg-graphite-secondary text-amber-700 dark:text-graphite-text-main text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-graphite-border`}>
                      Upskill
                   </div>
                </div>
             )}

             {/* Search Bar */}
             <div className="relative hidden md:block w-64 group z-50">
                <div className="relative">
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search topics..." 
                     className="w-full bg-slate-50 dark:bg-graphite-input border-2 border-transparent focus:border-indigo-500 dark:focus:border-graphite-text-sub rounded-xl py-2.5 pl-10 pr-8 text-xs font-bold text-slate-700 dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted transition-all outline-none"
                   />
                   <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-graphite-text-muted transition-colors group-focus-within:text-indigo-500 dark:group-focus-within:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   
                   {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-graphite-text-main">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-graphite-surface rounded-2xl shadow-xl border border-slate-100 dark:border-graphite-border overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
                     {searchResults.length > 0 ? (
                       <div className="py-2">
                         {searchResults.map((result, idx) => (
                           <button 
                             key={idx}
                             onClick={() => {
                               setSearchQuery('');
                               if (result.type === 'SUBJECT') {
                                 handleSubjectSelection(result.data.id);
                               } else {
                                 handleStartTopicStudy(result.data.subject, result.data.topic);
                               }
                             }}
                             className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-graphite-secondary transition-colors flex flex-col gap-0.5 border-b border-slate-50 dark:border-graphite-border last:border-0"
                           >
                              <span className="text-xs font-bold text-slate-800 dark:text-graphite-text-main line-clamp-1">{result.title}</span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-widest">{result.subtitle}</span>
                           </button>
                         ))}
                       </div>
                     ) : (
                       <div className="p-6 text-center">
                          <p className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted">No matches found.</p>
                       </div>
                     )}
                  </div>
                )}
             </div>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
             <div className="h-10 w-[1px] bg-slate-200 dark:bg-graphite-border hidden md:block"></div>
             {view === 'chat' && (
               <div className="hidden md:flex bg-slate-100 dark:bg-graphite-secondary p-1.5 rounded-2xl border border-slate-200 dark:border-graphite-border shadow-inner">
                 <button 
                  onClick={() => setStyle(ExplanationStyle.COMPANION)}
                  className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${style === ExplanationStyle.COMPANION ? `bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base shadow-md` : 'text-slate-500 dark:text-graphite-text-muted hover:text-slate-800 dark:hover:text-graphite-text-main'}`}
                 >Companion</button>
                 <button 
                  onClick={() => setStyle(ExplanationStyle.PROFESSOR)}
                  className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${style === ExplanationStyle.PROFESSOR ? `bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base shadow-md` : 'text-slate-500 dark:text-graphite-text-muted hover:text-slate-800 dark:hover:text-graphite-text-main'}`}
                 >Professor</button>
               </div>
             )}
             <div className={`hidden md:flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white dark:text-graphite-base shadow-xl transition-all duration-500 bg-indigo-600 dark:bg-graphite-action`}>
                <div className={`w-2 h-2 rounded-full animate-pulse bg-white dark:bg-graphite-base`}></div>
                {category} MODE
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export default App;
