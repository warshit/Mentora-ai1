
import { Type } from "@google/genai";

export enum LearningCategory {
  ACADEMIC = 'ACADEMIC',
  UPSKILL = 'UPSKILL'
}

export enum ExplanationStyle {
  COMPANION = 'COMPANION',
  PROFESSOR = 'PROFESSOR'
}

export enum LearningMode {
  CONCEPT = 'CONCEPT',
  EXAM = 'EXAM',
  INTERVIEW = 'INTERVIEW',
  PRACTICAL = 'PRACTICAL',
  UNDETERMINED = 'UNDETERMINED'
}

export type DoubtType = 'General' | 'Exam' | 'Concept';

export type TopicStatus = 'Not Started' | 'In Progress' | 'Practiced' | 'Completed' | 'Needs Revision';

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  priority: 'High' | 'Medium' | 'Low';
  isHistoricalWeakness: boolean;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester?: string;
  units: Unit[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: number;
  doubtType?: DoubtType;
  mode?: LearningMode;
}

export interface StudySession {
  id: string;
  title: string;
  category: LearningCategory;
  subjectId?: string;
  topicId?: string;
  messages: Message[];
  lastUpdated: number;
}

export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
}

export interface ProductivityStats {
  totalFocusMinutes: number;
  sessionsCompleted: number;
  dailyStreak: number;
  lastSessionDate: string;
  todaySessions: number;
}

export interface SkillDataPoint {
  date: string;
  score: number;
  topicId: string;
  topicName: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultMode: LearningCategory;
  explanationStyle: ExplanationStyle;
  notifications: {
    quizReminders: boolean;
    revisionReminders: boolean;
  };
  textSize: 'small' | 'medium' | 'large';
}

export interface StudentProfile {
  rollNumber: string;
  department: string;
  year: number;
  memory: {
    historicalWeakTopics: string[];
    completedCredits: number;
    lastActiveSession?: number;
  };
  topicNotes: Record<string, string>;
  preferences: UserPreferences;
  productivity: ProductivityStats;
  pomodoroSettings: PomodoroSettings;
  skillHistory?: SkillDataPoint[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizConfig {
  title: string;
  type: 'MODULE' | 'TOPIC';
  questions: QuizQuestion[];
  subjectId: string;
}

export interface TopicStudyContent {
  overview: string;
  keyConcepts: string;
  examFocus: string;
  examples: string;
  quickRevision: string;
}

export interface PracticeQuestion {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  difficulty: string;
}

export interface SkillAnalysisResult {
  roleMatch: string;
  strongSkills: string[];
  gaps: { skill: string; level: string; priority: string }[];
  path: { step: number; topic: string; estimatedHours: string; focus: string }[];
  summary: string;
}

export interface ScheduleConfig {
  hoursPerDay: number;
  targetDate: string;
  includedDays: string[];
}

export interface ScheduleTask {
  id: string;
  day: string;
  subject: string;
  topic: string;
  type: 'Study' | 'Revision' | 'Practice' | 'Quiz';
  duration: number;
  status: 'Planned' | 'Completed';
}

export interface StudySchedule {
  id: string;
  createdAt: number;
  tasks: ScheduleTask[];
  config: ScheduleConfig;
}

export interface StudyPlan {
    text?: string;
}

export interface DSATestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string; // Markdown
  constraints: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: string;
  driverCode?: string; // New: Wrapper code to hide boilerplate from user
  testCases: DSATestCase[];
  topics: string[];
}

export interface DSASection {
  id: string;
  title: string;
  description: string;
  problems: DSAProblem[];
}

export interface DSAProgress {
  [problemId: string]: {
    status: 'Solved' | 'Attempted';
    timestamp: number;
    code?: string;
  };
}

// --- EXAM MODE TYPES ---

export interface ExamConfig {
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionCount: number;
  mode: 'TIMED' | 'UNTIMED';
}

export interface ExamQuestionResult {
  problemId: string;
  status: 'Correct' | 'Incorrect' | 'Skipped';
  timeSpent: number;
}

export interface ExamSession {
  questions: DSAProblem[];
  currentIndex: number;
  results: ExamQuestionResult[];
  startTime: number;
  totalTimeLimit: number | null; // In seconds, null for untimed
}
