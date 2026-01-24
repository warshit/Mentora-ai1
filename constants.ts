
import { Type } from "@google/genai";
import { DSASection, Subject } from "./types";

export const INITIAL_GREETING = "Hello! I'm your AI Study Companion. Select a subject to get started.";

export const SYSTEM_INSTRUCTION = `
You are an advanced AI Learning Companion designed for university students and career aspirants.
Context:
Student Profile: {{STUDENT_CONTEXT}}
Current Mode: {{CATEGORY}} (Academic or Upskill)
Explanation Style: {{STYLE}}
Selected Semester: {{SEMESTER_SELECTION}}
Active Subject: {{SUBJECT_SELECTION}}
Learning Goal: {{ACTIVE_MODE}}

Your Memory of Student Weaknesses: {{MEMORY}}

Syllabus Context:
{{SYLLABUS_CONTEXT}}

Guidelines:
1.  **Persona**: Adapt to {{STYLE}}. If 'Companion', be encouraging and clear. If 'Professor', be formal, precise, and academic.
2.  **Context Awareness**: Use the provided syllabus context to answer. Do not hallucinate outside the scope unless asked for real-world examples.
3.  **Exam Focus**: If in Academic mode, highlight definitions, key terms, and standard answers expected in exams.
4.  **Upskill Focus**: If in Upskill mode, focus on industry application, best practices, and interview relevance.
5.  **Weakness Reinforcement**: If the user asks about a topic in {{MEMORY}}, proactively offer extra simplification or a quick quiz.

CRITICAL RENDERING CONSTRAINT (NON-NEGOTIABLE):
The platform DOES NOT support LaTeX or math rendering. ANY LaTeX-style syntax (like $...$ or \\Sigma) will break the UI.

ABSOLUTE OUTPUT RULE:
- DO NOT output LaTeX math syntax ($ ... $).
- DO NOT output backslash-escaped commands (\\Sigma, \\delta, \\epsilon, etc.).
- DO NOT use Math environments or Inline math wrappers.

MANDATORY SYMBOL OUTPUT FORMAT:
ALL mathematical and logical symbols MUST be output as PLAIN UNICODE CHARACTERS.
Use the following mappings ALWAYS:
- Σ  (not \\Sigma)
- δ  (not \\delta)
- ε  (not \\epsilon)
- ∈  (not \\in)
- ⊆  (not \\subseteq)
- →  (not \\rightarrow)
- ×  (not \\times)
- ∪  (not \\cup)
- ∩  (not \\cap)
- ≥  (not \\ge)
- ≤  (not \\le)
- ≠  (not \\neq)
- q₀ (not q_0)
- aⁿ (use superscripts where possible)

TEXT FORMATTING RULE:
- Keep content readable as plain text.
- Avoid any syntax that requires rendering engines.
- Prefer clear textual explanations with symbols embedded naturally.
`;

export const SYLLABUS_PARSER_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      code: { type: Type.STRING },
      name: { type: Type.STRING },
      semester: { type: Type.STRING },
      units: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            number: { type: Type.INTEGER },
            title: { type: Type.STRING },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  status: { type: Type.STRING, enum: ["Not Started"] },
                  isHistoricalWeakness: { type: Type.BOOLEAN }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const MOCK_CURRICULUM: Record<string, Subject[]> = {
  "CSE": [
    {
      id: "sub-comm-1",
      code: "AHSD01",
      name: "Professional Communication",
      semester: "I",
      units: [
        {
          id: "unit-1-comm",
          number: 1,
          title: "General Introduction and Listening Skills",
          topics: [
            { id: "t-comm-1-1", name: "Introduction to Communication Skills", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-2", name: "Meaning and Definition of Communication", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-3", name: "Communication Process", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-4", name: "Elements of Communication", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-5", name: "Types of Communication (Verbal and Non-Verbal)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-6", name: "Soft Skills – Meaning and Characteristics", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-7", name: "Hard Skills – Meaning and Characteristics", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-comm-1-8", name: "Difference Between Soft Skills and Hard Skills", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-9", name: "Importance of Soft Skills for Engineers", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-10", name: "Listening Skills – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-11", name: "Significance of Listening Skills", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-12", name: "Stages of Listening", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-13", name: "Barriers to Listening", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-1-14", name: "Effectiveness of Listening", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-1-15", name: "Listening Comprehension", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-comm",
          number: 2,
          title: "Speaking Skill",
          topics: [
            { id: "t-comm-2-1", name: "Significance of Speaking Skills", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-2-2", name: "Essentials of Speaking Skills", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-2-3", name: "Verbal Communication", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-2-4", name: "Non-Verbal Communication", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-2-5", name: "Role of Verbal and Non-Verbal Communication in Speaking", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-2-6", name: "Generating Talks Based on Visual Prompts", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-comm-2-7", name: "Public Speaking – Introduction", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-2-8", name: "Exposure to Structured Talks", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-2-9", name: "Techniques for Delivering Speech Effectively", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-2-10", name: "Oral Presentation – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-2-11", name: "Designing Oral Presentations Using PowerPoint Slides", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-2-12", name: "Delivering Effective Oral Presentations", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-comm",
          number: 3,
          title: "Vocabulary and Grammar",
          topics: [
            { id: "t-comm-3-1", name: "Concept of Word Formation", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-2", name: "Idioms and Phrases", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-3", name: "One-Word Substitutes", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-4", name: "Sentence Structure – Introduction", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-comm-3-5", name: "Simple Sentences", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-6", name: "Compound Sentences", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-7", name: "Complex Sentences", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-8", name: "Usage of Punctuation Marks", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-9", name: "Advanced Level Prepositions", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-10", name: "Tenses", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-11", name: "Subject–Verb Agreement", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-12", name: "Degrees of Comparison", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-13", name: "Direct Speech", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-3-14", name: "Indirect Speech", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-3-15", name: "Question Tags", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-comm",
          number: 4,
          title: "Reading Skill",
          topics: [
            { id: "t-comm-4-1", name: "Significance of Reading Skills", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-4-2", name: "Reading Comprehension", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-4-3", name: "Reading Strategies", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-4-4", name: "Skimming", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-4-5", name: "Scanning", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-4-6", name: "Inferential Reading", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-4-7", name: "Critical Reading", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-4-8", name: "Reading Comprehension (Unseen Passage)", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-comm",
          number: 5,
          title: "Writing Skill",
          topics: [
            { id: "t-comm-5-1", name: "Significance of Writing Skills", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-2", name: "Effectiveness of Writing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-3", name: "Paragraph Writing – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-4", name: "Role of Topic Sentence in a Paragraph", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-5", name: "Role of Supporting Sentences in a Paragraph", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-6", name: "Organizing Principles of Paragraphs in a Document", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-7", name: "Writing Introductions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-8", name: "Writing Conclusions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-9", name: "Techniques for Writing Precis", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-10", name: "Letter Writing – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-11", name: "Block Format of Letter Writing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-12", name: "Full Block Format of Letter Writing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-13", name: "Semi Block Format of Letter Writing", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-comm-5-14", name: "E-mail Writing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-comm-5-15", name: "Report Writing", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-math-1",
      code: "AHSD02",
      name: "Matrices and Calculus",
      semester: "I",
      units: [
        {
          id: "unit-1-math",
          number: 1,
          title: "Matrices",
          topics: [
            { id: "t-math-1-1", name: "Rank of a Matrix", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-1-2", name: "Rank of a Matrix by Echelon Form", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-1-3", name: "Rank of a Matrix by Normal Form", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-1-4", name: "Inverse of Non-Singular Matrices", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-1-5", name: "Inverse of a Matrix by Gauss–Jordan Method", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-1-6", name: "System of Linear Equations", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-1-7", name: "Homogeneous System of Linear Equations", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-1-8", name: "Non-Homogeneous System of Linear Equations", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-1-9", name: "Solving Systems of Linear Equations", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-math",
          number: 2,
          title: "Eigen Values and Eigen Vectors",
          topics: [
            { id: "t-math-2-1", name: "Eigen Values", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-2-2", name: "Eigen Vectors", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-2-3", name: "Properties of Eigen Values and Eigen Vectors", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-2-4", name: "Cayley–Hamilton Theorem", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-2-5", name: "Verification of Cayley–Hamilton Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-2-6", name: "Finding Inverse using Cayley–Hamilton Theorem", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-2-7", name: "Finding Power of Matrix using Cayley–Hamilton Theorem", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-2-8", name: "Diagonalization of a Matrix", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-math",
          number: 3,
          title: "Functions of Single and Several Variables",
          topics: [
            { id: "t-math-3-1", name: "Functions of a Single Variable", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-math-3-2", name: "Mean Value Theorems – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-3", name: "Rolle’s Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-4", name: "Lagrange’s Mean Value Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-5", name: "Cauchy’s Mean Value Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-6", name: "Functions of Several Variables", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-7", name: "Partial Differentiation", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-3-8", name: "Jacobian", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-3-9", name: "Functional Dependence", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-3-10", name: "Maxima and Minima of Functions of Two Variables", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-3-11", name: "Maxima and Minima of Functions of Three Variables", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-3-12", name: "Method of Lagrange Multipliers", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-math",
          number: 4,
          title: "Fourier Series",
          topics: [
            { id: "t-math-4-1", name: "Periodic Functions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-4-2", name: "Fourier Expansion of Periodic Functions", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-4-3", name: "Fourier Series in Interval of Length 2π", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-4-4", name: "Fourier Series of Even Functions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-4-5", name: "Fourier Series of Odd Functions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-4-6", name: "Fourier Series in an Arbitrary Interval", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-4-7", name: "Half-Range Fourier Sine Series", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-4-8", name: "Half-Range Fourier Cosine Series", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-math",
          number: 5,
          title: "Multiple Integrals",
          topics: [
            { id: "t-math-5-1", name: "Double Integrals – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-5-2", name: "Evaluation of Double Integrals in Cartesian Coordinates", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-5-3", name: "Evaluation of Double Integrals in Polar Coordinates", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-5-4", name: "Change of Order of Integration (Cartesian)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-math-5-5", name: "Triple Integrals – Introduction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-math-5-6", name: "Evaluation of Triple Integrals (Cartesian)", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-elec-1",
      code: "AEED01",
      name: "Elements of Electrical and Electronics Engineering",
      semester: "I",
      units: [
        {
          id: "unit-1-elec",
          number: 1,
          title: "Introduction to Electrical Circuits",
          topics: [
            { id: "t-elec-1-1", name: "Ohm’s Law & Kirchhoff’s Laws", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-1-2", name: "Star–Delta Transformation", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-1-3", name: "Mesh Analysis (DC)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-1-4", name: "Nodal Analysis (DC)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-1-5", name: "AC Fundamentals (RMS, Avg, Form Factor)", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-1-6", name: "RLC Series Circuit", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-elec",
          number: 2,
          title: "Network Theorems and Three-Phase Voltages",
          topics: [
            { id: "t-elec-2-1", name: "Superposition Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-2-2", name: "Thevenin’s & Norton’s Theorems", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-2-3", name: "Maximum Power Transfer Theorem", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-2-4", name: "Three-Phase Star & Delta Connections", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-2-5", name: "Voltage & Current Relationships", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-elec",
          number: 3,
          title: "Electrical Machines and Semiconductor Diodes",
          topics: [
            { id: "t-elec-3-1", name: "DC/AC Machines Principle & EMF Equation", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-3-2", name: "Machine Losses & Efficiency", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-3-3", name: "P-N Junction Diode Characteristics", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-3-4", name: "Rectifiers (Half, Full, Bridge)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-3-5", name: "Zener Diode Regulator", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-elec",
          number: 4,
          title: "Bipolar Junction Transistor and Applications",
          topics: [
            { id: "t-elec-4-1", name: "BJT Working Principle (NPN/PNP)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-4-2", name: "BJT Configurations (CE, CB, CC)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-4-3", name: "Input & Output Characteristics", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-elec-4-4", name: "Transistor as a Switch", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-elec",
          number: 5,
          title: "Transistor Amplifiers",
          topics: [
            { id: "t-elec-5-1", name: "Small-Signal Transistor Models", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-5-2", name: "CE Amplifier Amplification", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-5-3", name: "h-Parameter Model Analysis", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-elec-5-4", name: "Emitter Follower Analysis", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-oop-1",
      code: "ACSD01",
      name: "Object Oriented Programming",
      semester: "I",
      units: [
        {
          id: "unit-1-oop",
          number: 1,
          title: "Object-Oriented Concepts",
          topics: [
            { id: "t-oop-1-1", name: "Objects and Legacy Systems", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-oop-1-2", name: "Procedural vs Object-Oriented Programming", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-1-3", name: "Top-Down vs Bottom-Up Approaches", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-1-4", name: "Benefits & Applications of OOP", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-oop-1-5", name: "Features of OOP (Encapsulation, Inheritance, etc.)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-1-6", name: "Abstraction (Layers, Forms, Mechanisms)", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-oop",
          number: 2,
          title: "Classes and Objects",
          topics: [
            { id: "t-oop-2-1", name: "Defining Classes and Creating Objects", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-2-2", name: "Attributes, Methods, and Messages", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-2-3", name: "Class Diagrams", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-2-4", name: "Access Specifiers (Public, Private, Protected)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-2-5", name: "Initialization & Memory Allocation", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-2-6", name: "Static Members and Methods", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-oop",
          number: 3,
          title: "Special Member Functions and Overloading",
          topics: [
            { id: "t-oop-3-1", name: "Constructors (Default, Parameterized, Copy, Dynamic)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-3-2", name: "Destructors", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-3-3", name: "Function and Constructor Overloading", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-3-4", name: "Operator Overloading (Unary & Binary)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-3-5", name: "Friend Functions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-oop",
          number: 4,
          title: "Inheritance and Polymorphism",
          topics: [
            { id: "t-oop-4-1", name: "Types of Inheritance", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-4-2", name: "Ambiguity in Multiple Inheritance", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-4-3", name: "Virtual Base Classes", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-4-4", name: "Function Overriding", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-4-5", name: "Polymorphism (Static vs Dynamic)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-4-6", name: "Virtual Functions & Pure Virtual Functions", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-4-7", name: "Abstract Classes", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-oop",
          number: 5,
          title: "Console I/O and Working with Files",
          topics: [
            { id: "t-oop-5-1", name: "Console I/O Streams", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oop-5-2", name: "Unformatted I/O & Manipulators", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-oop-5-3", name: "File Operations (Read, Write, Append)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oop-5-4", name: "Command Line Arguments", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-1",
      code: "ACSD31",
      name: "Theory of Computation",
      semester: "V",
      units: [
        {
          id: "unit-1-toc",
          number: 1,
          title: "Finite Automata",
          topics: [
            { id: "t-toc-1-1", name: "Alphabet, Languages and Grammars", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-1-2", name: "Chomsky Hierarchy of Languages", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-1-3", name: "Deterministic Finite Automata (DFA)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-1-4", name: "Non-Deterministic Finite Automata (NFA)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-1-5", name: "Conversion of NFA to DFA", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-1-6", name: "Moore & Mealy Machines", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-toc",
          number: 2,
          title: "Regular Languages",
          topics: [
            { id: "t-toc-2-1", name: "Regular Sets & Regular Expressions", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-2-2", name: "Arden's Theorem / State Elimination", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-2-3", name: "Pumping Lemma for Regular Languages", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-2-4", name: "Closure Properties", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-toc",
          number: 3,
          title: "Context Free Grammars",
          topics: [
            { id: "t-toc-3-1", name: "CFG & Context-Free Languages", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-3-2", name: "Derivation Trees & Ambiguity", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-3-3", name: "Simplification of CFG (CNF, GNF)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-3-4", name: "Pushdown Automata (PDA)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-3-5", name: "Pumping Lemma for CFLs", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-toc",
          number: 4,
          title: "Turing Machines",
          topics: [
            { id: "t-toc-4-1", name: "Context-Sensitive Grammars & LBA", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-toc-4-2", name: "Turing Machine Model & Design", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-4-3", name: "Computable Functions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-4-4", name: "Church’s Hypothesis", status: "Not Started", priority: "Low", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-toc",
          number: 5,
          title: "Undecidability",
          topics: [
            { id: "t-toc-5-1", name: "Universal Turing Machine", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-toc-5-2", name: "Rice’s Theorem", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-5-3", name: "Post Correspondence Problem (PCP)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-toc-5-4", name: "Recursive & Recursively Enumerable", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-2",
      code: "ACSD15",
      name: "Object Oriented Software Engineering",
      semester: "V",
      units: [
        {
          id: "unit-1-oose",
          number: 1,
          title: "Introduction to SE",
          topics: [
            { id: "t-oose-1-1", name: "Software Development Process Models", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-1-2", name: "Agile Development", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-1-3", name: "Project Management Metrics", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-1-4", name: "OO Concepts & Principles", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-oose",
          number: 2,
          title: "Planning and Scheduling",
          topics: [
            { id: "t-oose-2-1", name: "SRS & Prototyping", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-2-2", name: "Software Cost Estimation (COCOMO)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-2-3", name: "Project Planning & Risk Management", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-2-4", name: "OO Estimation", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-oose",
          number: 3,
          title: "Analysis Modeling",
          topics: [
            { id: "t-oose-3-1", name: "Functional & Behavioral Modeling", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-3-2", name: "Structured vs OO Analysis", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-3-3", name: "UML Modeling", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-3-4", name: "Object Relationship Model", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-oose",
          number: 4,
          title: "Design Concepts",
          topics: [
            { id: "t-oose-4-1", name: "Modularity & Software Architecture", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-4-2", name: "Data Design & Transform Mapping", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-4-3", name: "OO Design Process", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-4-4", name: "System Design Process", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-oose",
          number: 5,
          title: "Testing and Maintenance",
          topics: [
            { id: "t-oose-5-1", name: "Top-Down & Bottom-Up Implementation", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-oose-5-2", name: "White Box Testing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-5-3", name: "Black Box Testing", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-oose-5-4", name: "Software Maintenance & Reengineering", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-3",
      code: "ACAD05",
      name: "Knowledge Representation and Reasoning",
      semester: "V",
      units: [
        {
          id: "unit-1-krr",
          number: 1,
          title: "The Key Concepts",
          topics: [
            { id: "t-krr-1-1", name: "Knowledge, Representation, Reasoning", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-1-2", name: "Role of Logic & History", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-krr-1-3", name: "Varieties of Logic", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-krr",
          number: 2,
          title: "Ontology",
          topics: [
            { id: "t-krr-2-1", name: "Ontological Categories", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-2-2", name: "Physical Entities & Abstractions", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-krr-2-3", name: "Sets, Collections, Types", status: "Not Started", priority: "Low", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-krr",
          number: 3,
          title: "Knowledge Representations",
          topics: [
            { id: "t-krr-3-1", name: "Knowledge Engineering", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-3-2", name: "Frames & Structures", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-3-3", name: "OO Systems & Semantics", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-krr",
          number: 4,
          title: "Processes",
          topics: [
            { id: "t-krr-4-1", name: "Time, Events, Situations", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-krr-4-2", name: "Classification of Processes", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-krr-4-3", name: "Constraint Satisfaction", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-krr",
          number: 5,
          title: "Knowledge Soup",
          topics: [
            { id: "t-krr-5-1", name: "Vagueness & Uncertainty", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-5-2", name: "Fuzzy & Non-Monotonic Logic", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-krr-5-3", name: "Knowledge Acquisition & Sharing", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-4",
      code: "ACAD06",
      name: "Machine Learning Algorithms",
      semester: "V",
      units: [
        {
          id: "unit-1-ml",
          number: 1,
          title: "Introduction to ML",
          topics: [
            { id: "t-ml-1-1", name: "Supervised vs Unsupervised Learning", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-1-2", name: "Concept Learning & Version Spaces", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-1-3", name: "Candidate Elimination Algorithm", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-1-4", name: "Linear Regression & Perceptron", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-ml",
          number: 2,
          title: "Multi Layer Perceptron",
          topics: [
            { id: "t-ml-2-1", name: "Backpropagation Algorithm", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-2-2", name: "Radial Basis Functions (RBF)", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-2-3", name: "Curse of Dimensionality", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-2-4", name: "Support Vector Machines (SVM)", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-ml",
          number: 3,
          title: "Learning With Trees",
          topics: [
            { id: "t-ml-3-1", name: "Decision Trees (Construction, CART)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-3-2", name: "Ensemble Learning (Boosting, Bagging, Combining Classifiers)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-3-3", name: "K-Nearest Neighbors (KNN)", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-3-4", name: "K-Means Clustering", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-ml",
          number: 4,
          title: "Dimensionality Reduction",
          topics: [
            { id: "t-ml-4-1", name: "PCA & LDA", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-4-2", name: "ICA & Factor Analysis", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-4-3", name: "Evolutionary Learning / Genetic Algos", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-ml",
          number: 5,
          title: "Advanced Topics",
          topics: [
            { id: "t-ml-5-1", name: "Forecasting (ARIMA)", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-ml-5-2", name: "Recommender Systems", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-ml-5-3", name: "Naive Bayes Classifier", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-5",
      code: "ACDD06",
      name: "Data Mining and Warehousing",
      semester: "VI",
      units: [
        {
          id: "unit-1-dm",
          number: 1,
          title: "Introduction",
          topics: [
            { id: "t-dm-1-1", name: "Data Mining Primitives", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-dm-1-2", name: "Data Preprocessing (Cleaning, Integration)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-1-3", name: "Data Warehousing Architecture", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-dm",
          number: 2,
          title: "Association Rule Mining",
          topics: [
            { id: "t-dm-2-1", name: "Market Basket Analysis", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-2-2", name: "Apriori Algorithm", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-2-3", name: "FP-Growth Algorithm", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-dm",
          number: 3,
          title: "Classification",
          topics: [
            { id: "t-dm-3-1", name: "Decision Tree Induction", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-dm-3-2", name: "Bayes Classification Methods", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-dm-3-3", name: "Model Evaluation & Selection", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-dm",
          number: 4,
          title: "Clustering",
          topics: [
            { id: "t-dm-4-1", name: "Partitioning Methods (K-Means)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-4-2", name: "Hierarchical Methods", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-dm-4-3", name: "Density-Based Methods (DBSCAN)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-4-4", name: "Grid-Based Methods", status: "Not Started", priority: "Low", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-dm",
          number: 5,
          title: "Advanced Data Mining",
          topics: [
            { id: "t-dm-5-1", name: "Time-Series & Sequential Data", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-dm-5-2", name: "Graph Mining & Social Networks", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-dm-5-3", name: "Web Mining", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "sub-6",
      code: "ACAD12",
      name: "Fuzzy Logic and Inference Systems",
      semester: "VI",
      units: [
        {
          id: "unit-1-fl",
          number: 1,
          title: "Classical & Fuzzy Sets",
          topics: [
            { id: "t-fl-1-1", name: "Crisp vs Fuzzy Sets", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-fl-1-2", name: "Operations on Fuzzy Sets", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-1-3", name: "Membership Functions", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-1-4", name: "Fuzzification & Defuzzification", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-2-fl",
          number: 2,
          title: "Fuzzy Relations",
          topics: [
            { id: "t-fl-2-1", name: "Cartesian Product", status: "Not Started", priority: "Low", isHistoricalWeakness: false },
            { id: "t-fl-2-2", name: "Fuzzy Composition (Max-Min)", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-2-3", name: "Fuzzy Equivalence Relations", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-3-fl",
          number: 3,
          title: "Fuzzy Logic & Reasoning",
          topics: [
            { id: "t-fl-3-1", name: "Linguistic Variables", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-fl-3-2", name: "Fuzzy Propositions & Rules", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-3-3", name: "Fuzzy Implication & Inference", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-4-fl",
          number: 4,
          title: "Fuzzy Inference Systems",
          topics: [
            { id: "t-fl-4-1", name: "Mamdani Fuzzy Models", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-4-2", name: "Sugeno Fuzzy Models", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "t-fl-4-3", name: "Tsukamoto Models", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-fl-4-4", name: "Design of Fuzzy Controllers", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "unit-5-fl",
          number: 5,
          title: "Applications",
          topics: [
            { id: "t-fl-5-1", name: "Fuzzy Control Systems", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-fl-5-2", name: "Pattern Recognition", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "t-fl-5-3", name: "Neuro-Fuzzy Systems", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    }
  ],
  "UPSKILL": [
    {
      id: "skill-java-fs",
      code: "CAREER-JAVA",
      name: "Java Full Stack Developer",
      semester: "UPSKILL",
      units: [
        {
          id: "u-j1",
          number: 1,
          title: "Core Java & DSA",
          topics: [
            { id: "st-1", name: "Collections Framework", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-2", name: "Multithreading", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        },
        {
          id: "u-j2",
          number: 2,
          title: "Backend Development",
          topics: [
            { id: "st-3", name: "Spring Boot Basics", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-4", name: "REST API Design", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "skill-ml",
      code: "CAREER-ML",
      name: "Machine Learning Engineer",
      semester: "UPSKILL",
      units: [
        {
          id: "u-ml1",
          number: 1,
          title: "Supervised Learning",
          topics: [
            { id: "st-ml1", name: "Linear Regression", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-ml2", name: "Decision Trees", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "u-ml2",
          number: 2,
          title: "Neural Networks",
          topics: [
            { id: "st-ml3", name: "Backpropagation", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-ml4", name: "CNNs & RNNs", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "skill-web",
      code: "CAREER-WEB",
      name: "Frontend Developer (React)",
      semester: "UPSKILL",
      units: [
        {
          id: "u-web1",
          number: 1,
          title: "Modern React",
          topics: [
            { id: "st-web1", name: "Hooks & Context", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-web2", name: "State Management", status: "Not Started", priority: "Medium", isHistoricalWeakness: false }
          ]
        },
        {
          id: "u-web2",
          number: 2,
          title: "Advanced UI",
          topics: [
            { id: "st-web3", name: "Tailwind CSS", status: "Not Started", priority: "Medium", isHistoricalWeakness: false },
            { id: "st-web4", name: "Performance Optimization", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    },
    {
      id: "skill-ai",
      code: "CAREER-AI",
      name: "AI Specialist",
      semester: "UPSKILL",
      units: [
        {
          id: "u-ai1",
          number: 1,
          title: "Generative AI",
          topics: [
            { id: "st-ai1", name: "LLM Architecture", status: "Not Started", priority: "High", isHistoricalWeakness: false },
            { id: "st-ai2", name: "Prompt Engineering", status: "Not Started", priority: "High", isHistoricalWeakness: false }
          ]
        }
      ]
    }
  ]
};

export const DSA_CURRICULUM: DSASection[] = [
  {
    id: 'arrays-hashing',
    title: 'Arrays & Hashing',
    description: 'Core techniques: Prefix Sums, Hash Maps, and Array Manipulation.',
    problems: [
      {
        id: 'dsa-two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        description: `Given an array of integers \`nums\` and an integer \`target\`, find the indices of the two numbers such that they add up to \`target\`.
        
Assume that each input would have exactly one solution, and you may not use the same element twice.`,
        constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9`,
        examples: [
          { input: "9\n2 7 11 15", output: "0 1", explanation: "nums[0] + nums[1] == 9, so we print 0 1." },
          { input: "6\n3 2 4", output: "1 2" }
        ],
        starterCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextInt()) return;
        int target = scanner.nextInt();
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();

        Solution solution = new Solution();
        int[] result = solution.twoSum(nums, target);
        if (result != null && result.length == 2) {
            Arrays.sort(result); // Normalize output order
            System.out.println(result[0] + " " + result[1]);
        } else {
            System.out.println("[]");
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "9\n2 7 11 15", expectedOutput: "0 1" },
          { input: "6\n3 2 4", expectedOutput: "1 2" },
          { input: "6\n3 3", expectedOutput: "0 1", isHidden: true }
        ]
      },
      {
        id: 'dsa-contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        topics: ['Array', 'Hash Table'],
        description: `Given an integer array \`nums\`, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
        constraints: `1 <= nums.length <= 10^5`,
        examples: [
          { input: "1 2 3 1", output: "true" },
          { input: "1 2 3 4", output: "false" }
        ],
        starterCode: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        
        Solution solution = new Solution();
        System.out.println(solution.containsDuplicate(nums));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "1 2 3 1", expectedOutput: "true" },
          { input: "1 2 3 4", expectedOutput: "false" },
          { input: "1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", isHidden: true }
        ]
      },
      {
        id: 'dsa-valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        topics: ['String', 'Hash Table'],
        description: `Given two strings \`s\` and \`t\`, return true if \`t\` is an anagram of \`s\`, and false otherwise.`,
        constraints: `1 <= s.length, t.length <= 5 * 10^4`,
        examples: [
          { input: "anagram nagaram", output: "true" },
          { input: "rat car", output: "false" }
        ],
        starterCode: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        String t = scanner.next();
        Solution solution = new Solution();
        System.out.println(solution.isAnagram(s, t));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "anagram nagaram", expectedOutput: "true" },
          { input: "rat car", expectedOutput: "false" },
          { input: "a ab", expectedOutput: "false", isHidden: true }
        ]
      },
      {
        id: 'dsa-kadane',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        topics: ['Array', 'DP'],
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
        constraints: `1 <= nums.length <= 10^5`,
        examples: [
          { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." },
          { input: "1", output: "1" }
        ],
        starterCode: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        Solution solution = new Solution();
        System.out.println(solution.maxSubArray(nums));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
          { input: "1", expectedOutput: "1" },
          { input: "5 4 -1 7 8", expectedOutput: "23", isHidden: true }
        ]
      },
      {
        id: 'dsa-product-array',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        topics: ['Array', 'Prefix Sum'],
        description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.`,
        constraints: `2 <= nums.length <= 10^5`,
        examples: [
          { input: "1 2 3 4", output: "24 12 8 6" },
          { input: "-1 1 0 -3 3", output: "0 0 9 0 0" }
        ],
        starterCode: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        Solution solution = new Solution();
        int[] res = solution.productExceptSelf(nums);
        for(int i=0; i<res.length; i++) {
            System.out.print(res[i] + (i<res.length-1 ? " " : ""));
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "1 2 3 4", expectedOutput: "24 12 8 6" },
          { input: "-1 1 0 -3 3", expectedOutput: "0 0 9 0 0" }
        ]
      },
      {
        id: 'dsa-longest-consecutive',
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        topics: ['Array', 'Hash Table', 'Union Find'],
        description: `Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.
        
You must write an algorithm that runs in O(n) time.`,
        constraints: `0 <= nums.length <= 10^5`,
        examples: [
          { input: "100 4 200 1 3 2", output: "4", explanation: "The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4." },
          { input: "0 3 7 2 5 8 4 6 0 1", output: "9" }
        ],
        starterCode: `class Solution {
    public int longestConsecutive(int[] nums) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        Solution solution = new Solution();
        System.out.println(solution.longestConsecutive(nums));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "100 4 200 1 3 2", expectedOutput: "4" },
          { input: "0 3 7 2 5 8 4 6 0 1", expectedOutput: "9" }
        ]
      }
    ]
  },
  {
    id: 'two-pointers-sliding-window',
    title: 'Two Pointers & Sliding Window',
    description: 'Optimization techniques for linear data structures.',
    problems: [
      {
        id: 'dsa-valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        topics: ['Two Pointers', 'String'],
        description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.
        
Given a string \`s\`, return true if it is a palindrome, or false otherwise.`,
        constraints: `1 <= s.length <= 2 * 10^5`,
        examples: [
          { input: "A man, a plan, a canal: Panama", output: "true", explanation: "\"amanaplanacanalpanama\" is a palindrome." },
          { input: "race a car", output: "false", explanation: "\"raceacar\" is not a palindrome." }
        ],
        starterCode: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(scanner.hasNextLine()) {
            String s = scanner.nextLine();
            Solution solution = new Solution();
            System.out.println(solution.isPalindrome(s));
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "A man, a plan, a canal: Panama", expectedOutput: "true" },
          { input: "race a car", expectedOutput: "false" }
        ]
      },
      {
        id: 'dsa-best-time-stock',
        title: 'Best Time to Buy & Sell Stock',
        difficulty: 'Easy',
        topics: ['Array', 'Sliding Window', 'DP'],
        description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.
        
Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
        constraints: `1 <= prices.length <= 10^5`,
        examples: [
          { input: "7 1 5 3 6 4", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
          { input: "7 6 4 3 1", output: "0" }
        ],
        starterCode: `class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        Solution solution = new Solution();
        System.out.println(solution.maxProfit(nums));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "7 1 5 3 6 4", expectedOutput: "5" },
          { input: "7 6 4 3 1", expectedOutput: "0" }
        ]
      }
    ]
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    description: 'Traversal, cycle detection, and node manipulation.',
    problems: [
      {
        id: 'dsa-reverse-ll',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        topics: ['Linked List', 'Recursion'],
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        constraints: `0 <= number of nodes <= 5000`,
        examples: [
          { input: "1 2 3 4 5", output: "5 4 3 2 1" },
          { input: "1 2", output: "2 1" }
        ],
        starterCode: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        while(scanner.hasNextInt()) {
            current.next = new ListNode(scanner.nextInt());
            current = current.next;
        }
        
        Solution solution = new Solution();
        ListNode result = solution.reverseList(dummy.next);
        
        // Print list
        current = result;
        boolean first = true;
        while(current != null) {
            if(!first) System.out.print(" ");
            System.out.print(current.val);
            first = false;
            current = current.next;
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1" },
          { input: "1 2", expectedOutput: "2 1" }
        ]
      },
      {
        id: 'dsa-merge-sorted-ll',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        topics: ['Linked List', 'Recursion'],
        description: `Merge two sorted linked lists and return it as a sorted list.`,
        constraints: `0 <= nodes <= 50`,
        examples: [
          { input: "1 2 4\n1 3 4", output: "1 1 2 3 4 4" },
          { input: "\n0", output: "0" }
        ],
        starterCode: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Main {
    public static ListNode buildList(String line) {
        if(line == null || line.trim().isEmpty()) return null;
        Scanner sc = new Scanner(line);
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while(sc.hasNextInt()) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String line1 = scanner.hasNextLine() ? scanner.nextLine() : "";
        String line2 = scanner.hasNextLine() ? scanner.nextLine() : "";
        
        ListNode l1 = buildList(line1);
        ListNode l2 = buildList(line2);
        
        Solution solution = new Solution();
        ListNode result = solution.mergeTwoLists(l1, l2);
        
        boolean first = true;
        while(result != null) {
            if(!first) System.out.print(" ");
            System.out.print(result.val);
            first = false;
            result = result.next;
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4" },
          { input: "\n0", expectedOutput: "0" }
        ]
      }
    ]
  },
  {
    id: 'algorithms-dp-graph',
    title: 'Algorithms: Graph, DP & Search',
    description: 'Optimization problems, graph traversals, and advanced recursion.',
    problems: [
      {
        id: 'dsa-binary-search',
        title: 'Binary Search',
        difficulty: 'Easy',
        topics: ['Binary Search', 'Array'],
        description: `Given an array of integers \`nums\` sorted in ascending order, and an integer \`target\`, search \`target\` in \`nums\`.`,
        constraints: `1 <= nums.length <= 10^4`,
        examples: [
          { input: "9\n-1 0 3 5 9 12", output: "4", explanation: "9 exists in nums and its index is 4" },
          { input: "2\n-1 0 3 5 9 12", output: "-1", explanation: "2 does not exist in nums" }
        ],
        starterCode: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(!scanner.hasNextInt()) return;
        int target = scanner.nextInt();
        List<Integer> list = new ArrayList<>();
        while (scanner.hasNextInt()) {
            list.add(scanner.nextInt());
        }
        int[] nums = list.stream().mapToInt(i->i).toArray();
        Solution solution = new Solution();
        System.out.println(solution.search(nums, target));
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "9\n-1 0 3 5 9 12", expectedOutput: "4" },
          { input: "2\n-1 0 3 5 9 12", expectedOutput: "-1" },
          { input: "5\n5", expectedOutput: "0", isHidden: true }
        ]
      },
      {
        id: 'dsa-climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        topics: ['DP', 'Math'],
        description: `You are climbing a staircase. It takes \`n\` steps to reach the top.
        
Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
        constraints: `1 <= n <= 45`,
        examples: [
          { input: "2", output: "2", explanation: "1+1, 2" },
          { input: "3", output: "3", explanation: "1+1+1, 1+2, 2+1" }
        ],
        starterCode: `class Solution {
    public int climbStairs(int n) {
        // Your code here
    }
}`,
        driverCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(scanner.hasNextInt()) {
            Solution solution = new Solution();
            System.out.println(solution.climbStairs(scanner.nextInt()));
        }
    }
}

// USER_CODE_HERE`,
        testCases: [
          { input: "2", expectedOutput: "2" },
          { input: "3", expectedOutput: "3" },
          { input: "5", expectedOutput: "8" }
        ]
      }
    ]
  }
];

export const SYLLABUS_DEFINITIONS: Record<string, string> = {
  "AHSD01": `
**Subject Code**: AHSD01
**Subject Name**: Professional Communication
**Semester**: I

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: GENERAL INTRODUCTION AND LISTENING SKILLS**
- Introduction to Communication Skills
- Meaning and Definition of Communication
- Communication Process
- Elements of Communication
- Types of Communication (Verbal and Non-Verbal)
- Soft Skills – Meaning and Characteristics
- Hard Skills – Meaning and Characteristics
- Difference Between Soft Skills and Hard Skills
- Importance of Soft Skills for Engineers
- Listening Skills – Introduction
- Significance of Listening Skills
- Stages of Listening
- Barriers to Listening
- Effectiveness of Listening
- Listening Comprehension

**MODULE – II: SPEAKING SKILL**
- Significance of Speaking Skills
- Essentials of Speaking Skills
- Verbal Communication
- Non-Verbal Communication
- Role of Verbal and Non-Verbal Communication in Speaking
- Generating Talks Based on Visual Prompts
- Public Speaking – Introduction
- Exposure to Structured Talks
- Techniques for Delivering Speech Effectively
- Oral Presentation – Introduction
- Designing Oral Presentations Using PowerPoint Slides
- Delivering Effective Oral Presentations

**MODULE – III: VOCABULARY AND GRAMMAR**
- Concept of Word Formation
- Idioms and Phrases
- One-Word Substitutes
- Sentence Structure – Introduction
- Simple Sentences
- Compound Sentences
- Complex Sentences
- Usage of Punctuation Marks
- Advanced Level Prepositions
- Tenses
- Subject–Verb Agreement
- Degrees of Comparison
- Direct Speech
- Indirect Speech
- Question Tags

**MODULE – IV: READING SKILL**
- Significance of Reading Skills
- Reading Comprehension
- Reading Strategies
- Skimming
- Scanning
- Inferential Reading
- Critical Reading
- Reading Comprehension (Unseen Passage)

**MODULE – V: WRITING SKILL**
- Significance of Writing Skills
- Effectiveness of Writing
- Paragraph Writing – Introduction
- Role of Topic Sentence in a Paragraph
- Role of Supporting Sentences in a Paragraph
- Organizing Principles of Paragraphs in a Document
- Writing Introductions
- Writing Conclusions
- Techniques for Writing Precis
- Letter Writing – Introduction
- Block Format of Letter Writing
- Full Block Format of Letter Writing
- Semi Block Format of Letter Writing
- E-mail Writing
- Report Writing
`,
  "AHSD02": `
**Subject Code**: AHSD02
**Subject Name**: Matrices and Calculus
**Semester**: I

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: MATRICES**
- Rank of a Matrix
- Rank of a Matrix by Echelon Form
- Rank of a Matrix by Normal Form
- Inverse of Non-Singular Matrices
- Inverse of a Matrix by Gauss–Jordan Method
- System of Linear Equations
- Homogeneous System of Linear Equations
- Non-Homogeneous System of Linear Equations
- Solving Systems of Linear Equations

**MODULE – II: EIGEN VALUES AND EIGEN VECTORS**
- Eigen Values
- Eigen Vectors
- Properties of Eigen Values and Eigen Vectors (Without Proof)
- Cayley–Hamilton Theorem (Without Proof)
- Verification of Cayley–Hamilton Theorem
- Finding Inverse of a Matrix using Cayley–Hamilton Theorem
- Finding Power of a Matrix using Cayley–Hamilton Theorem
- Diagonalization of a Matrix

**MODULE – III: FUNCTIONS OF SINGLE AND SEVERAL VARIABLES**
- Functions of a Single Variable
- Mean Value Theorems – Introduction
- Rolle’s Theorem (Without Proof)
- Lagrange’s Mean Value Theorem (Without Proof)
- Cauchy’s Mean Value Theorem (Without Proof)
- Functions of Several Variables
- Partial Differentiation
- Jacobian
- Functional Dependence
- Maxima and Minima of Functions of Two Variables
- Maxima and Minima of Functions of Three Variables
- Method of Lagrange Multipliers

**MODULE – IV: FOURIER SERIES**
- Periodic Functions
- Fourier Expansion of Periodic Functions
- Fourier Series in a Given Interval of Length 2π
- Fourier Series of Even Functions
- Fourier Series of Odd Functions
- Fourier Series in an Arbitrary Interval
- Half-Range Fourier Sine Series
- Half-Range Fourier Cosine Series

**MODULE – V: MULTIPLE INTEGRALS**
- Double Integrals – Introduction
- Evaluation of Double Integrals in Cartesian Coordinates
- Evaluation of Double Integrals in Polar Coordinates
- Change of Order of Integration (Cartesian Coordinates Only)
- Triple Integrals – Introduction
- Evaluation of Triple Integrals (Cartesian Coordinates Only)
`,
  "AEED01": `
**Subject Code**: AEED01
**Subject Name**: Elements of Electrical and Electronics Engineering
**Semester**: I

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: INTRODUCTION TO ELECTRICAL CIRCUITS**
- Circuit concepts (Ohm’s law, Kirchhoff’s laws)
- Equivalent resistance
- Star–Delta transformation
- Mesh and nodal analysis (DC source only)
- Single-phase AC circuits
- Representation of alternating quantities
- RMS, Average, Form factor, Peak factor
- RLC series circuit

**MODULE – II: NETWORK THEOREMS AND THREE-PHASE VOLTAGES**
- Network theorems (DC circuits)
- Superposition Theorem
- Reciprocity Theorem
- Thevenin’s Theorem
- Norton’s Theorem
- Maximum power transfer Theorem
- Three-phase voltages (definitions)
- Star and Delta connections
- Voltage and current relationships in star and delta

**MODULE – III: ELECTRICAL MACHINES AND SEMICONDUCTOR DIODES**
- DC and AC machines (Motors and Generators)
- Principle of operation, Parts, EMF equation
- Types, Applications
- Losses and Efficiency
- Semiconductor diodes (P–N junction diode)
- Symbol, V–I characteristics
- Half-wave, Full-wave and Bridge rectifiers
- Filters
- Diode as switch
- Zener diode as voltage regulator

**MODULE – IV: BIPOLAR JUNCTION TRANSISTOR AND APPLICATIONS**
- BJT characteristics and configurations
- Working principle of NPN and PNP transistors
- CE, CB, CC configurations
- Input and output characteristics
- Transistor as a switch

**MODULE – V: TRANSISTOR AMPLIFIERS**
- Amplifier circuits
- Two-port devices and networks
- Small-signal models for transistors
- Concept of small-signal operation
- Amplification in CE amplifier
- h-parameter model of BJT (CE, CB, emitter follower analysis)
`,
  "ACSD01": `
**Subject Code**: ACSD01
**Subject Name**: Object Oriented Programming
**Semester**: I

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: OBJECT-ORIENTED CONCEPTS**
- Objects and Legacy Systems
- Procedural Programming vs Object-Oriented Programming
- Top-Down and Bottom-Up Approaches and their Differences
- Benefits of Object-Oriented Programming
- Applications of Object-Oriented Programming
- Features of Object-Oriented Programming
- Abstraction
- Layers of Abstraction
- Forms of Abstraction
- Abstraction Mechanisms

**MODULE – II: CLASSES AND OBJECTS**
- Classes and Objects
- Object Data and Object Behaviors
- Creating Objects
- Attributes, Methods, and Messages
- Creating Class Diagrams
- Accessing Class Members and Methods
- Access Specifiers (Public, Private, Protected)
- Initialization of Class Members
- Memory Allocation
- Static Members
- Static Methods

**MODULE – III: SPECIAL MEMBER FUNCTIONS AND OVERLOADING**
- Constructors and Destructors
- Need for Constructors and Destructors
- Copy Constructors
- Dynamic Constructors
- Parameterized Constructors
- Destructors
- Constructors and Destructors with Static Members
- Function Overloading
- Constructor Overloading
- Operator Overloading
- Rules for Operator Overloading
- Overloading Unary Operators
- Overloading Binary Operators
- Friend Functions

**MODULE – IV: INHERITANCE AND POLYMORPHISM**
- Inheritance
- Types of Inheritance
- Base Class and Derived Class
- Usage of Final Keyword
- Ambiguity in Multiple and Multipath Inheritance
- Virtual Base Class
- Overriding Member Functions
- Order of Execution of Constructors and Destructors
- Polymorphism – Introduction
- Static Polymorphism
- Dynamic Polymorphism
- Virtual Functions
- Pure Virtual Functions
- Abstract Classes

**MODULE – V: CONSOLE I/O AND WORKING WITH FILES**
- Console Input and Output
- Concept of Streams
- Hierarchy of Console Stream Classes
- Unformatted I/O Operations
- Managing Output using Manipulators
- Working with Files
- Opening Files
- Reading Files
- Writing Files
- Appending Files
- Processing Files
- Closing Files
- Command Line Arguments
`,
  "ACSD31": `
**Subject Code**: ACSD31
**Subject Name**: Theory of Computation
**Semester**: V

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: FINITE AUTOMATA**
- Alphabet, Languages and Grammars
- Productions and Derivation
- Chomsky Hierarchy of Languages
- Introduction to Automata Theory
- Deterministic Finite Automata (DFA)
- Non-Deterministic Finite Automata (NFA)
- Applications of Finite Automata
- Finite Automata with and without ε-transitions
- Conversion of NFA to DFA
- Moore Machines
- Mealy Machines

**MODULE – II: REGULAR LANGUAGES**
- Regular Sets & Regular Expressions
- DFA to Regular Expression (State Elimination Method)
- Regular Expression to Automata
- Applications of Regular Expressions
- Algebraic Laws for Regular Expressions
- Pumping Lemma for Regular Languages
- Closure & Decision Properties of Regular Languages

**MODULE – III: CONTEXT FREE GRAMMARS**
- Context-Free Grammars (CFG) and Context-Free Languages (CFL)
- Leftmost and Rightmost Derivations
- Parse Trees & Ambiguity in CFG
- Minimization of CFG, CNF, GNF
- Pushdown Automata (Definition, Final State/Empty Stack Acceptance)
- DPDA vs NPDA
- Equivalence of PDA and CFG
- Pumping Lemma for CFLs
- Closure Properties of CFLs

**MODULE – IV: LINEAR BOUNDED AUTOMATA AND TURING MACHINES**
- Context-Sensitive Grammars (CSG) & Linear Bounded Automata (LBA)
- Turing Machines (Definition, Model, Design)
- Computable Functions & Recursively Enumerable Languages
- Church’s Hypothesis
- Counter Machines & Types of TMs

**MODULE – V: UNDECIDABILITY**
- Unrestricted Grammars
- Turing Machines as Enumerators
- Universal Turing Machine
- Reductions Between Languages
- Rice’s Theorem
- Post Correspondence Problem (PCP) & Modified PCP
`,
  "ACSD15": `
**Subject Code**: ACSD15
**Subject Name**: Object Oriented Software Engineering
**Semester**: V

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: INTRODUCTION TO SOFTWARE ENGINEERING**
- Introduction to Software Engineering
- Software Development Process Models (Waterfall, Incremental, etc.)
- Agile Development
- Project and Process
- Project Management
- Process Metrics and Project Metrics
- Object-Oriented Concepts, Principles & Methodologies

**MODULE – II: PLANNING AND SCHEDULING**
- Software Requirements Specification (SRS)
- Software Prototyping
- Software Project Planning (Scope, Resources)
- Software Estimation & Empirical Estimation Models
- Project Planning Techniques
- Risk Management
- Software Project Scheduling
- Object-Oriented Estimation and Scheduling

**MODULE – III: ANALYSIS**
- Analysis Modeling (Data, Functional, Behavioral)
- Structured Analysis vs Object-Oriented Analysis
- Domain Analysis
- Object-Oriented Analysis Process
- Object Relationship Model & Object Behavior Model
- Design Modeling using UML

**MODULE – IV: DESIGN**
- Design Concepts and Principles
- Software Design Process
- Modular Design & Effective Modularity
- Software Architecture (Introduction)
- Data Design, Transform Mapping, Transaction Mapping
- Object-Oriented Design
- System Design Process & Object Design Process

**MODULE – V: IMPLEMENTATION, TESTING AND MAINTENANCE**
- Top-Down & Bottom-Up Implementation
- Object-Oriented Product Implementation
- Integration Strategies
- White Box Testing (Basis Path, Control Structure)
- Black Box Testing
- Unit, Integration, Validation, and System Testing
- Testing Tools
- Software Maintenance & Reengineering
`,
  "ACAD05": `
**Subject Code**: ACAD05
**Subject Name**: Knowledge Representation and Reasoning
**Semester**: V

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: THE KEY CONCEPTS**
- Knowledge, Representation, Reasoning
- Need for Knowledge Representation and Reasoning
- Role of Logic & Historical Background
- Representing Knowledge in Logic
- Varieties of Logic (Name, Type, Measures)
- Unity Amidst Diversity

**MODULE – II: ONTOLOGY**
- Ontological Categories & Philosophical Background
- Top-Level Categories
- Describing Physical Entities & Defining Abstractions
- Sets, Collections, Types and Categories
- Space and Time

**MODULE – III: KNOWLEDGE REPRESENTATIONS**
- Knowledge Engineering
- Representing Structure Using Frames
- Rules and Data
- Object-Oriented Systems
- Natural Language Semantics
- Levels of Representation

**MODULE – IV: PROCESSES**
- Time, Events and Situations
- Classification of Processes
- Procedures, Processes and Histories
- Concurrent Processes & Computation
- Constraint Satisfaction
- Contexts: Syntax, Semantics, First-Order/Modal Reasoning, Encapsulation

**MODULE – V: KNOWLEDGE SOUP**
- Vagueness, Uncertainty, Randomness and Ignorance
- Limitations of Logic (Fuzzy Logic, Non-Monotonic Logic)
- Theories, Models and the World
- Semiotics
- Knowledge Acquisition and Sharing (Ontologies, Conceptual Schema)
- Accommodating Multiple Paradigms
- Relating Different Knowledge Representations
- Language Patterns & Tools for Knowledge Acquisition
`,
  "ACAD06": `
**Subject Code**: ACAD06
**Subject Name**: Machine Learning Algorithms
**Semester**: V

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: INTRODUCTION TO MACHINE LEARNING**
- Learning Types (Supervised, etc.) & Designing a Learning System
- Perspectives and Issues in ML
- Concept Learning (Task, Search, Maximally Specific Hypothesis)
- Version Spaces & Candidate Elimination Algorithm
- Linear Discriminants, Perceptron, Linear Separability
- Linear Regression

**MODULE – II: MULTI LAYER PERCEPTRON**
- Multilayer Perceptron (Forward/Backward Pass, Backpropagation Derivation)
- Radial Basis Functions (RBF) & RBF Networks
- Splines & Interpolation
- Curse of Dimensionality
- Support Vector Machines (SVM)

**MODULE – III: LEARNING WITH TREES**
- Decision Trees (Construction, CART)
- Ensemble Learning (Boosting, Bagging, Combining Classifiers)
- Basic Statistics & Gaussian Mixture Models (GMM)
- Nearest Neighbor Methods
- Unsupervised Learning & K-Means Algorithm

**MODULE – IV: DIMENSIONALITY REDUCTION**
- Linear Discriminant Analysis (LDA) & Principal Component Analysis (PCA)
- Factor Analysis & Independent Component Analysis (ICA)
- Locally Linear Embedding (LLE) & Isomap
- Least Squares Optimization
- Evolutionary Learning (Genetic Algorithms, Operators, Applications)

**MODULE – V: ADVANCED TOPICS AND USE CASES**
- Forecasting: Time Series Decomposition, ARIMA Model
- Recommender Systems: Association Rules, Collaborative Filtering, Matrix Factorization
- Text Analysis: Sentiment Classification, Naive Bayes
- Use Cases: Manufacturing, Retail, Transport, Healthcare, Weather, Insurance
`,
  "ACDD06": `
**Subject Code**: ACDD06
**Subject Name**: Data Mining and Warehousing
**Semester**: VI

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: INTRODUCTION & DATA PREPROCESSING**
- Fundamentals of Data Mining & Warehousing
- Data Mining Primitives
- Data Objects and Attribute Types
- Data Preprocessing: Cleaning, Integration, Reduction
- Data Transformation and Discretization
- Data Warehousing Architecture

**MODULE – II: ASSOCIATION RULE MINING**
- Market Basket Analysis
- Frequent Itemsets, Closed Itemsets, and Association Rules
- Apriori Algorithm
- FP-Growth Algorithm
- Pattern Evaluation Methods
- Advanced Pattern Mining

**MODULE – III: CLASSIFICATION**
- Basic Concepts of Classification
- Decision Tree Induction
- Bayes Classification Methods
- Rule-Based Classification
- Model Evaluation and Selection
- Techniques to Improve Classification Accuracy

**MODULE – IV: CLUSTERING**
- Cluster Analysis Basic Concepts
- Partitioning Methods (K-Means, K-Medoids)
- Hierarchical Methods (Agglomerative, Divisive)
- Density-Based Methods (DBSCAN)
- Grid-Based Methods
- Evaluation of Clustering

**MODULE – V: ADVANCED DATA MINING**
- Mining Complex Data Types
- Time-Series, Sequential, and Sequence Data
- Graph Mining and Social Network Analysis
- Web Mining (Content, Structure, Usage)
- Spatial and Multimedia Data Mining
`,
  "ACAD12": `
**Subject Code**: ACAD12
**Subject Name**: Fuzzy Logic and Inference Systems
**Semester**: VI

**COURSE CONTENT (AUTHORITATIVE SCOPE):**

**MODULE – I: CLASSICAL SETS AND FUZZY SETS**
- Crisp Sets vs Fuzzy Sets
- Operations on Fuzzy Sets
- Fuzzy Set Properties
- Membership Functions
- Fuzzification and Defuzzification

**MODULE – II: FUZZY RELATIONS**
- Crisp vs Fuzzy Relations
- Cartesian Product
- Operations on Fuzzy Relations
- Fuzzy Composition (Max-Min, Max-Product)
- Fuzzy Equivalence Relations
- Value Assignments

**MODULE – III: FUZZY LOGIC & APPROXIMATE REASONING**
- Fuzzy Logic Systems
- Linguistic Variables
- Fuzzy Propositions
- Fuzzy If-Then Rules
- Fuzzy Implications and Inferences
- Approximate Reasoning

**MODULE – IV: FUZZY INFERENCE SYSTEMS**
- Structure of Fuzzy Inference Systems
- Mamdani Fuzzy Models
- Sugeno Fuzzy Models
- Tsukamoto Fuzzy Models
- Design of Fuzzy Controllers
- Comparison of Inference Systems

**MODULE – V: APPLICATIONS**
- Fuzzy Logic in Control Systems
- Fuzzy Pattern Recognition
- Fuzzy Database Systems
- Fuzzy Decision Making
- Hybrid Systems (Neuro-Fuzzy)
`
};
