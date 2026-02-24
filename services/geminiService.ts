
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION, SYLLABUS_PARSER_SCHEMA, SYLLABUS_DEFINITIONS } from "../constants";
import { Message, StudentProfile, LearningCategory, ExplanationStyle, DoubtType, LearningMode, QuizQuestion, TopicStudyContent, PracticeQuestion, SkillAnalysisResult, ScheduleConfig, ScheduleTask } from "../types";
import { handleApiError } from "../utils/errorHandling";
import { getCachedAIResponse, saveAIResponseWithCache } from "./firebaseService";

// Initialize AI instance on demand to prevent top-level crashes
const getAI = () => {
  // Fix: Use Vite environment variable with proper typing
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing. Check your .env.local file.");
    throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for retry logic to handle transient network/RPC errors
async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a rate limit error (429)
    const isRateLimit = error?.message?.includes('429') || 
                        error?.message?.includes('Too Many Requests') ||
                        error?.message?.includes('RESOURCE_EXHAUSTED');
    
    if (isRateLimit) {
      // For rate limits, use longer delays and provide better error message
      if (retries <= 0) {
        throw new Error('⚠️ API rate limit exceeded. Please wait a few minutes before trying again. Consider using the cached responses or reducing request frequency.');
      }
      
      const rateLimitDelay = delay * 3; // Longer delay for rate limits
      console.warn(`⏳ Rate limit hit, waiting ${rateLimitDelay}ms before retry... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
      return withRetry(operation, retries - 1, rateLimitDelay);
    }
    
    // For other errors, use normal retry logic
    if (retries <= 0) throw handleApiError(error);
    
    console.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 2);
  }
}

// ... (keep existing exports until generateCodeAssistance)

export const getGeminiResponse = async (
  history: Message[], 
  userInput: string, 
  student: StudentProfile | null, 
  category: LearningCategory,
  style: ExplanationStyle = ExplanationStyle.COMPANION,
  semester: string = 'V',
  subjectCode: string = '',
  activeMode: string = 'CONCEPT'
) => {
  try {
    // Step 1: Check cache first
    const cachedResponse = await getCachedAIResponse(userInput);
    if (cachedResponse) {
      console.log('🎯 Cache hit! Returning cached response');
      
      // Still need to determine doubt type and mode for cached responses
      const text = cachedResponse.response;
      let detectedType: DoubtType = 'General';
      let detectedMode: LearningMode = LearningMode.UNDETERMINED;

      const lowerText = text.toLowerCase();

      if (text.includes("Do you want this explanation for exams or for understanding?")) {
        detectedType = 'General';
        detectedMode = LearningMode.UNDETERMINED;
      } else {
        if (category === LearningCategory.UPSKILL) {
          if (lowerText.includes("complexity analysis") || lowerText.includes("interview perspective") || lowerText.includes("big o")) {
            detectedMode = LearningMode.INTERVIEW;
          } else if (lowerText.includes("industry strategy") || lowerText.includes("utility") || lowerText.includes("production")) {
            detectedMode = LearningMode.PRACTICAL;
          }
        } else {
          const hasDefinition = lowerText.includes("definition");
          const hasWritingTip = lowerText.includes("writing tip") || lowerText.includes("marks");
          
          if (hasDefinition && hasWritingTip) {
            detectedMode = LearningMode.EXAM;
            detectedType = 'Exam';
          } else if (lowerText.includes("step-by-step") || lowerText.includes("understand") || lowerText.includes("sense so far")) {
            detectedMode = LearningMode.CONCEPT;
            detectedType = 'Concept';
          }
        }
      }

      return { text, doubtType: detectedType, mode: detectedMode };
    }

    // Step 2: No cache found, call AI API
    console.log('🚀 Cache miss! Calling Gemini API');
    
    const ai = getAI();
    const studentContext = student 
      ? `Year: ${student.year}, Dept: ${student.department}, Roll: ${student.rollNumber}` 
      : "Unknown background";
    
    const memoryContext = student?.memory?.historicalWeakTopics?.length 
      ? student.memory.historicalWeakTopics.join(", ") 
      : "No historical weaknesses recorded yet.";

    let syllabusContext = "General Academic Context.";
    if (category === LearningCategory.ACADEMIC && subjectCode) {
      if (SYLLABUS_DEFINITIONS[subjectCode]) {
        syllabusContext = SYLLABUS_DEFINITIONS[subjectCode];
      } else {
        syllabusContext = `Subject Code: ${subjectCode}. Syllabus not loaded.`;
      }
    } else if (category === LearningCategory.UPSKILL) {
      syllabusContext = "Focus on Career Development, Technical Interviews, and Industry Standards.";
    }

    const personalizedInstruction = SYSTEM_INSTRUCTION
      .replace('{{STUDENT_CONTEXT}}', studentContext)
      .replace('{{CATEGORY}}', category)
      .replace('{{STYLE}}', style)
      .replace('{{ACTIVE_MODE}}', activeMode)
      .replace('{{MEMORY}}', memoryContext)
      .replace('{{SEMESTER_SELECTION}}', semester || "None")
      .replace('{{SUBJECT_SELECTION}}', subjectCode || "None")
      .replace('{{SYLLABUS_CONTEXT}}', syllabusContext);

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: personalizedInstruction,
        temperature: 0.1, 
      },
    }));

    const text = response.text || "I'm sorry, I couldn't process that.";
    
    // Step 3: Save to cache (fire and forget - don't block the response)
    saveAIResponseWithCache(userInput, text).catch(error => {
      console.warn('Failed to save AI response to cache:', error);
    });
    
    let detectedType: DoubtType = 'General';
    let detectedMode: LearningMode = LearningMode.UNDETERMINED;

    const lowerText = text.toLowerCase();

    if (text.includes("Do you want this explanation for exams or for understanding?")) {
      detectedType = 'General';
      detectedMode = LearningMode.UNDETERMINED;
    } else {
      if (category === LearningCategory.UPSKILL) {
        if (lowerText.includes("complexity analysis") || lowerText.includes("interview perspective") || lowerText.includes("big o")) {
          detectedMode = LearningMode.INTERVIEW;
        } else if (lowerText.includes("industry strategy") || lowerText.includes("utility") || lowerText.includes("production")) {
          detectedMode = LearningMode.PRACTICAL;
        }
      } else {
        const hasDefinition = lowerText.includes("definition");
        const hasWritingTip = lowerText.includes("writing tip") || lowerText.includes("marks");
        
        if (hasDefinition && hasWritingTip) {
          detectedMode = LearningMode.EXAM;
          detectedType = 'Exam';
        } else if (lowerText.includes("step-by-step") || lowerText.includes("understand") || lowerText.includes("sense so far")) {
          detectedMode = LearningMode.CONCEPT;
          detectedType = 'Concept';
        }
      }
    }

    return { text, doubtType: detectedType, mode: detectedMode };
  } catch (error) {
    console.error("Gemini API Error:", error);
    const appError = handleApiError(error);
    return { 
      text: appError.message, 
      doubtType: 'General' as DoubtType, 
      mode: LearningMode.UNDETERMINED 
    };
  }
};

export const parseSyllabusText = async (text: string) => {
  try {
    const ai = getAI();
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the syllabus structure from the following text into a JSON roadmap. TEXT: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: SYLLABUS_PARSER_SCHEMA,
      }
    }));
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Syllabus Parse Error:", error);
    return null;
  }
};

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswerIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING }
    }
  }
};

export const generateQuiz = async (
  subjectCode: string,
  subjectName: string,
  unitTitle: string,
  topicName: string | null,
  isModuleQuiz: boolean
): Promise<QuizQuestion[]> => {
  try {
    const ai = getAI();
    const syllabusContext = SYLLABUS_DEFINITIONS[subjectCode] || "";
    const count = isModuleQuiz ? 10 : 5;
    const scope = isModuleQuiz ? `the entire Module '${unitTitle}'` : `the specific topic '${topicName}' inside Module '${unitTitle}'`;
    
    const isUpskill = subjectCode.startsWith('CAREER') || subjectName.toLowerCase().includes('interview') || subjectName.toLowerCase().includes('upskill');
    
    let difficultyRules = `
      DIFFICULTY RULES:
      - Easy: Concept recall and definitions.
      - Medium: Application and understanding.
      - Exam-Oriented: Typical university semester questions.
      - NO out-of-syllabus questions.
    `;

    if (isUpskill) {
        difficultyRules = `
        DIFFICULTY RULES (INTERVIEW MODE):
        - Focus on Output Prediction, Time Complexity Analysis, and Corner Cases.
        - Questions should mimic Technical Screening questions.
        - Include scenarios involving code snippets or system design constraints.
        - Prioritize questions that test deep understanding of the algorithm/pattern.
        `;
    }

    const prompt = `
      Generate a ${count}-question Multiple Choice Quiz for ${subjectName} (${subjectCode}).
      
      SCOPE: Strictly based on ${scope}.
      CONTEXT: ${syllabusContext}
      
      ${difficultyRules}

      CRITICAL RENDERING RULE: NO LATEX allowed. Use Unicode for math symbols (e.g. Σ, δ, ε, ->).
      
      FORMAT:
      - JSON Array.
      - 4 Options per question.
      - 1 Correct Answer.
      - Short explanation for the correct answer.
    `;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
        temperature: 0.3
      }
    }));

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};

const TOPIC_STUDY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING },
    keyConcepts: { type: Type.STRING },
    examFocus: { type: Type.STRING },
    examples: { type: Type.STRING },
    quickRevision: { type: Type.STRING }
  },
  required: ["overview", "keyConcepts", "examFocus", "examples", "quickRevision"]
};

export const generateTopicStudyContent = async (
  subjectCode: string,
  subjectName: string,
  unitTitle: string,
  topicName: string,
  semester: string
): Promise<TopicStudyContent | null> => {
  try {
    const ai = getAI();
    const syllabusContext = SYLLABUS_DEFINITIONS[subjectCode] || "Use general academic knowledge appropriate for the subject.";
    
    const isUpskill = semester === 'UPSKILL' || subjectCode.startsWith('CAREER') || subjectName.toLowerCase().includes('interview');

    const prompt = `
    SYSTEM ROLE:
    You are an Academic Content Generator for a University-Level Learning Platform.

    OBJECTIVE:
    Generate DETAILED, COMPREHENSIVE academic content for the topic: "${topicName}"
    Subject: ${subjectName} (${subjectCode})
    Module: ${unitTitle}
    Semester: ${semester}

    CONTEXT: ${syllabusContext}

    ==================================================
    CONTENT DEPTH REQUIREMENT (NON-NEGOTIABLE)
    ==================================================

    Responses MUST be:
    - More detailed than short notes.
    - More explanatory than bullet-only answers.
    - Suitable for 10–15 minutes of focused reading per topic.
    - DO NOT produce minimal or shallow content.

    ==================================================
    MANDATORY CONTENT EXPANSION RULES
    ==================================================

    1. Overview:
       - What the topic is.
       - Why it is important.
       - How it fits into the subject/module.

    2. Key Concepts:
       - Clear explanations.
       - Context and intuition.
       - Supporting explanation (not one-liners).

    3. Exam Focus:
       - At least 3 short-answer questions.
       - At least 2 long-answer questions.
       - Framed exactly like university exams.

    4. Examples:
       - Multiple examples where applicable.
       - Step-by-step explanation.
       - Clearly linked to concepts.

    5. Quick Revision:
       - Summarizes ideas.
       - Uses recall-friendly language.
       - Does NOT repeat full explanations.

    ==================================================
    WRITING STYLE
    ==================================================
    - Academic but readable.
    - Natural sentence flow.
    - No robotic shorthand.
    - Explain ideas in words first, symbols second.

    ==================================================
    CRITICAL RENDERING CONSTRAINT (NON-NEGOTIABLE)
    ==================================================
    - The platform DOES NOT support LaTeX or math rendering.
    - ANY LaTeX-style syntax (like $...$ or \\Sigma) will break the UI.
    - USE ONLY PLAIN UNICODE SYMBOLS (e.g. Σ, δ, ε, →, ≤, ≥, ≠, ²).

    OUTPUT FORMAT:
    Return a valid JSON object matching the schema.
    `;

    let response: GenerateContentResponse;
    try {
      response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: TOPIC_STUDY_SCHEMA,
          temperature: 0.2
        }
      }));
    } catch (primaryError) {
      console.warn("Primary model (Pro) failed, attempting fallback to Flash:", primaryError);
      response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: TOPIC_STUDY_SCHEMA,
          temperature: 0.2
        }
      }));
    }

    if (response.text) {
      return JSON.parse(response.text) as TopicStudyContent;
    }
    return null;
  } catch (error) {
    console.error("Topic Content Generation Error:", error);
    return null;
  }
};

const PRACTICE_QUESTIONS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      question: { type: Type.STRING },
      answer: { type: Type.STRING },
      explanation: { type: Type.STRING },
      difficulty: { type: Type.STRING }
    }
  }
};

export const generatePracticeQuestions = async (
  subject: string,
  topic: string,
  category: LearningCategory
): Promise<PracticeQuestion[]> => {
  try {
    const ai = getAI();
    const isUpskill = category === LearningCategory.UPSKILL;
    
    let instructions = "";
    if (isUpskill) {
      instructions = `
        ROLE: Senior Technical Interviewer (FAANG Level).
        TASK: Generate 5 Practice Questions for '${topic}' in '${subject}'.
        
        REQUIREMENTS:
        1. Mix of Conceptual, Coding Logic (Pseudo/Snippet), and System Design/Behavioral if applicable.
        2. DIFFICULTY: Range from Medium to Hard.
        3. EXPLANATION FIELD: Must include TIME COMPLEXITY and SPACE COMPLEXITY analysis where applicable.
        4. ANSWER FIELD: Detailed model answer or optimal code solution.
      `;
    } else {
      instructions = `
        ROLE: University Professor.
        TASK: Generate 5 Exam-Style Practice Questions for '${topic}' in '${subject}'.
        
        REQUIREMENTS:
        1. Questions should be a mix of Definitions, Derivations, and Long-Answer Explanations.
        2. DIFFICULTY: Standard University Exam Level.
        3. EXPLANATION FIELD: Provide "Key Marking Points" or "Exam Tips" for this question.
        4. ANSWER FIELD: A comprehensive model answer students should write in an exam.
      `;
    }

    const prompt = `
      ${instructions}
      
      CRITICAL RENDERING RULE: NO LATEX allowed. Use Unicode for math symbols (e.g. Σ, δ, ε, ->).

      OUTPUT FORMAT: JSON Array of objects.
      NO Markdown code blocks around the JSON.
    `;

    // Implement 30s Timeout Race
    const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 30000)
    );

    const apiCall = withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PRACTICE_QUESTIONS_SCHEMA,
        temperature: 0.4
      }
    }));

    // Race against timeout
    const response = await Promise.race([apiCall, timeoutPromise]) as GenerateContentResponse;

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Practice Generation Error:", error);
    // Explicitly rethrow AI_TIMEOUT so UI knows, otherwise return empty array
    if (error instanceof Error && error.message === 'AI_TIMEOUT') {
        throw error;
    }
    return [];
  }
};

const SKILL_GAP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    roleMatch: { type: Type.STRING },
    strongSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    gaps: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: {
          skill: { type: Type.STRING },
          level: { type: Type.STRING }, // Beginner, Intermediate, Advanced
          priority: { type: Type.STRING } // Critical, High, Medium
        } 
      } 
    },
    path: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          topic: { type: Type.STRING },
          estimatedHours: { type: Type.STRING },
          focus: { type: Type.STRING }
        }
      }
    },
    summary: { type: Type.STRING }
  },
  required: ["strongSkills", "gaps", "path", "summary"]
};

export const analyzeSkillGaps = async (
  inputText: string,
  type: 'RESUME' | 'TEST_RESULTS',
  trackContext: string
): Promise<SkillAnalysisResult | null> => {
  try {
    const ai = getAI();
    let prompt = "";

    if (type === 'RESUME') {
      prompt = `
        Analyze the following Resume Content for the target role: "${trackContext}".
        RESUME: ${inputText}
        
        TASK:
        1. Identify STRONG SKILLS relevant to the role.
        2. Identify SKILL GAPS (Critical/High Priority) needed for the role but missing/weak in resume.
        3. Create a Step-by-Step Learning Path to bridge gaps.
      `;
    } else {
      prompt = `
        Analyze the following Diagnostic Quiz Performance for the target role: "${trackContext}".
        PERFORMANCE SUMMARY: ${inputText}
        
        TASK:
        1. Identify what the user knows (Strong Skills).
        2. Identify weak areas (Skill Gaps).
        3. Create a Step-by-Step Learning Path to bridge gaps.
      `;
    }

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SKILL_GAP_SCHEMA,
        temperature: 0.2
      }
    }));

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Skill Gap Analysis Error:", error);
    return null;
  }
};

// --- CODING ASSISTANT ---

export const generateCodeAssistance = async (
  code: string,
  output: string,
  error: string,
  problemContext: string,
  history: { role: 'user' | 'model', text: string }[],
  userPrompt: string
): Promise<string> => {
  try {
    const ai = getAI();
    
    const contextBlock = `
    CONTEXT:
    Problem: ${problemContext || 'General Java Programming'}
    
    Current Code:
    \`\`\`java
    ${code}
    \`\`\`
    
    Console Output:
    ${output || '(Empty)'}
    
    Errors:
    ${error || '(None)'}
    `;

    const systemPrompt = `
    SYSTEM ROLE:
    You are a DSA Coding Assistant embedded ONLY inside the DSA Solve Problem page.

    SCOPE:
    This prompt applies ONLY to:
    Upskill → DSA → Solve Problem → Compiler AI

    DO NOT use this prompt anywhere else.

    CRITICAL RENDERING CONSTRAINT:
    - NO LaTeX allowed.
    - Use Unicode for math symbols.
    - SPECIFICALLY FOR BIG O NOTATION: Use O(n²), O(log n), etc. DO NOT USE $O(n^2)$.
    - Failure to follow this breaks the UI.

    ==================================================
    PRIMARY BEHAVIOR RULE (NON-NEGOTIABLE)
    ==================================================

    ❗ ANSWER THE USER QUESTION FIRST.
    ❗ DO NOT AUTO-ANALYZE USER CODE.
    ❗ DO NOT READ FULL CODE UNLESS EXPLICITLY ASKED.

    User intent ALWAYS overrides code context.

    ==================================================
    HARD OVERRIDE RULE (VERY IMPORTANT)
    ==================================================

    The AI MUST follow this decision tree for EVERY message:

    STEP 1: Read the USER QUESTION  
    STEP 2: Decide if CODE IS REQUIRED  
    STEP 3: Use MINIMUM context required  
    STEP 4: Answer ONLY what is asked  

    If the question can be answered WITHOUT code → IGNORE CODE COMPLETELY.

    ==================================================
    WHEN YOU MUST IGNORE USER CODE (MANDATORY)
    ==================================================

    If user asks:
    - “Give me a hint”
    - “Explain the approach”
    - “What data structure should I use?”
    - “What is the time complexity?”
    - “Why does this testcase fail conceptually?”
    - “How to think about this problem?”

    THEN:
    - ❌ DO NOT read code
    - ❌ DO NOT mention code lines
    - ✅ Answer conceptually only

    ==================================================
    WHEN YOU MAY PARTIALLY READ CODE
    ==================================================

    ONLY read the MINIMUM section of code if user asks:
    - “Why is this condition failing?”
    - “Why am I getting wrong answer?”
    - “Which part is incorrect?”

    Rules:
    - Inspect ONLY the relevant logic
    - Reference at most 1–2 lines
    - Do NOT explain entire solution

    ==================================================
    WHEN FULL CODE ANALYSIS IS ALLOWED
    ==================================================

    ONLY if user explicitly says:
    - “Analyze my code”
    - “Review my solution”
    - “Optimize my implementation”
    - “Explain my code line by line”

    Without these phrases → FULL ANALYSIS IS FORBIDDEN.

    ==================================================
    RESPONSE FORMAT (MANDATORY)
    ==================================================

    Every response MUST follow this order:

    1) Direct answer to the user question (1–2 lines)
    2) Short reasoning (only what is needed)
    3) Optional hint or suggestion
    4) Optional code reference (ONLY if asked)

    NO introductions.
    NO full walkthroughs.
    NO restating the problem.

    ==================================================
    DSA-SPECIFIC RESTRICTIONS
    ==================================================

    - Do NOT generate full solutions unless explicitly asked
    - Prefer hints over answers
    - Prefer logic over syntax
    - Prefer approach over implementation

    ==================================================
    ANTI-PATTERNS (ABSOLUTELY FORBIDDEN)
    ==================================================

    - “Let me explain your entire code…” ❌
    - Explaining class / function structure ❌
    - Rewriting user code automatically ❌
    - Assuming user wants a review ❌
    - Ignoring the question ❌

    ==================================================
    PERFORMANCE & COST RULES
    ==================================================

    - Do NOT process entire code unless required
    - Reduce token usage
    - Faster response is preferred
    - No unnecessary reasoning

    ==================================================
    SUCCESS CRITERIA
    ==================================================

    This change is successful ONLY if:
    - AI answers exactly what the user asks
    - Code is ignored unless needed
    - Responses are short and precise
    - DSA AI feels like LeetCode hints, not a reviewer
    - Users stop complaining about irrelevant explanations
    `;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }, 
        { role: 'model', parts: [{ text: "Understood. I will strictly follow the DSA Coding Assistant guidelines, prioritizing the user's specific question and minimizing code analysis unless requested." }] },
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: contextBlock + "\n\nUSER REQUEST: " + userPrompt }] }
      ],
      config: {
        temperature: 0.2,
        maxOutputTokens: 500, // Keep it concise
      }
    }));

    return response.text || "I couldn't analyze the code at this moment.";
  } catch (error) {
    console.error("Code Assistant Error:", error);
    return "The AI assistant is temporarily unavailable. Please check your network.";
  }
};

// --- LEARNING INSIGHTS ---

export const generateLearningInsights = async (student: StudentProfile): Promise<string[]> => {
  try {
    const ai = getAI();
    
    // Safe summarization of student context
    const history = student.skillHistory || [];
    const recent = history.slice(-5);
    const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
    const weakTopics = student.memory.historicalWeakTopics.slice(0, 5).join(", ");
    
    const context = `
      Student Context:
      - Recent Quiz Scores: ${recent.map(r => `${r.score}% (${r.topicName || 'Unknown'})`).join(", ")}
      - Overall Average Score: ${avgScore}%
      - Known Weak Areas: ${weakTopics || "None"}
      - Current Study Streak: ${student.productivity?.dailyStreak || 0} days
      - Total Sessions Completed: ${student.productivity?.sessionsCompleted || 0}
    `;

    const prompt = `
      Analyze this student's recent learning data.
      Provide exactly 3 short, actionable, and encouraging observations in a JSON array of strings.
      
      RULES:
      1. Focus on patterns (improvement, decline, consistency).
      2. Suggest specific actions based on weak areas if present (e.g. "Review Recursion").
      3. Be concise (max 15 words per observation).
      4. No generic motivational quotes. Data-driven only.
      
      DATA: ${context}
    `;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash is sufficient and fast for insights
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        temperature: 0.3
      }
    }));

    return JSON.parse(response.text || "[\"Keep practicing to see insights here.\"]");
  } catch (error) {
    console.error("Insight Generation Error:", error);
    return ["Unable to generate insights at this moment. Please try again later."];
  }
};

// --- STRUCTURED STUDY SCHEDULE GENERATOR (NEW) ---

const SCHEDULE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      day: { type: Type.STRING },
      subject: { type: Type.STRING },
      topic: { type: Type.STRING },
      type: { type: Type.STRING },
      duration: { type: Type.INTEGER },
      status: { type: Type.STRING }
    }
  }
};

export const generateStructuredSchedule = async (
  config: ScheduleConfig,
  subjects: string[],
  weakTopics: string
): Promise<ScheduleTask[]> => {
  try {
    const ai = getAI();
    
    const prompt = `
    GENERATE A REALISTIC STUDY SCHEDULE.
    
    **PARAMETERS:**
    - Subjects: ${subjects.join(", ")}
    - Daily Study Hours: ${config.hoursPerDay}
    - Study Days: ${config.includedDays.join(", ")}
    - Target Date: ${config.targetDate}
    - Priority Topics (Weaknesses): ${weakTopics}
    
    **TASK RULES:**
    1. Distribute topics evenly but prioritize weak topics early in the week.
    2. Activity Types must be one of: 'Study', 'Revision', 'Practice', 'Quiz'.
    3. Duration should be in minutes (e.g., 45, 60, 90).
    4. Generate a plan for ONE WEEK (approx 5-7 days of tasks).
    5. Return strict JSON array.
    `;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEDULE_SCHEMA,
        temperature: 0.2
      }
    }));

    const rawTasks = JSON.parse(response.text || "[]");
    
    // Normalize and add IDs if missing
    return rawTasks.map((t: any, idx: number) => ({
        id: `task-${Date.now()}-${idx}`,
        day: t.day || "Mon",
        subject: t.subject || "General",
        topic: t.topic || "Study Session",
        type: t.type || "Study",
        duration: t.duration || 60,
        status: 'Planned'
    }));

  } catch (error) {
    console.error("Schedule Generation Error:", error);
    return [];
  }
};
    