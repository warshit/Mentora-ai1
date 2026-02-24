
import React, { useState, useEffect, useRef } from 'react';
import { DSAProblem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { generateCodeAssistance } from '../services/geminiService';

interface PistonResponse {
    run: {
        stdout: string;
        stderr: string;
        code: number;
        output: string;
    };
    compile?: {
        stderr: string;
        code: number;
    };
}

interface JavaCompilerProps {
    problem?: DSAProblem;
    onBack?: () => void;
    onSolve?: () => void;
    headerContent?: React.ReactNode; // New Prop for injecting UI
}

type TabType = 'description' | 'testcases' | 'submissions';
type ConsoleState = 'closed' | 'open' | 'maximized';

const JavaCompiler: React.FC<JavaCompilerProps> = ({ problem, onBack, onSolve, headerContent }) => {
    // --- STATE: Layout & Content ---
    const [code, setCode] = useState(problem?.starterCode || `// Write your code here...`);
    const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Percentage
    const [activeLeftTab, setActiveLeftTab] = useState<TabType>('description');
    const [consoleState, setConsoleState] = useState<ConsoleState>('closed');
    const [outputHeight, setOutputHeight] = useState(300); // Default height in pixels
    const [activeTestCaseId, setActiveTestCaseId] = useState(0); // 0, 1... for samples
    const [customInput, setCustomInput] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    // --- STATE: Execution ---
    const [isRunning, setIsRunning] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null); // Last run result
    const [submissionResult, setSubmissionResult] = useState<any>(null); // Full submit result
    
    // --- STATE: AI ---
    const [showAi, setShowAi] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiChat, setAiChat] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [aiInput, setAiInput] = useState('');
    const aiScrollRef = useRef<HTMLDivElement>(null);

    // --- REFS ---
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const dragRef = useRef(false); // Left panel resize ref
    const outputDragRef = useRef(false); // Output panel resize ref

    // Reset state when problem changes
    useEffect(() => {
        if (problem) {
            setCode(problem.starterCode);
            setCustomInput(problem.examples[0]?.input || '');
            setExecutionResult(null);
            setSubmissionResult(null);
            setConsoleState('closed');
            setAiChat([]);
        }
    }, [problem?.id]);

    // Scroll AI chat to bottom
    useEffect(() => {
        if (aiScrollRef.current) {
            aiScrollRef.current.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [aiChat, isAiLoading, showAi]);

    // --- RESIZER LOGIC ---
    const handleMouseDown = () => { dragRef.current = true; document.body.style.cursor = 'col-resize'; };
    
    const handleOutputMouseDown = (e: React.MouseEvent) => { 
        e.preventDefault(); 
        e.stopPropagation();
        outputDragRef.current = true; 
        document.body.style.cursor = 'row-resize'; 
    };

    const handleMouseUp = () => { 
        dragRef.current = false; 
        outputDragRef.current = false;
        document.body.style.cursor = 'default'; 
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Left Panel Resize
        if (dragRef.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
        }

        // Output Panel Resize
        if (outputDragRef.current) {
            const newHeight = window.innerHeight - e.clientY;
            // Min height 36px (header), Max height 90% of screen
            if (newHeight >= 36 && newHeight < window.innerHeight * 0.9) {
                setOutputHeight(newHeight);
                
                // Automatically open console if dragged open from closed state
                if (consoleState === 'closed' && newHeight > 40) {
                    setConsoleState('open');
                }
                // If dragging while maximized, treat as custom size (open)
                if (consoleState === 'maximized') {
                    setConsoleState('open');
                }
                // If dragged too small, close it
                if (newHeight <= 40 && consoleState !== 'closed') {
                    setConsoleState('closed');
                }
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [consoleState]); 

    // --- VALIDATION HELPER ---
    const validateJavaCode = (input: string): string | null => {
        if (!input || !input.trim()) return "Code editor is empty.";

        let braceBalance = 0;
        let inString = false;
        let inChar = false;
        let escape = false;
        let inLineComment = false;
        let inBlockComment = false;

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            const nextChar = input[i + 1];

            if (inLineComment) {
                if (char === '\n') inLineComment = false;
                continue;
            }

            if (inBlockComment) {
                if (char === '*' && nextChar === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }

            // Check for comments start
            if (!inString && !inChar) {
                if (char === '/' && nextChar === '/') {
                    inLineComment = true;
                    i++;
                    continue;
                }
                if (char === '/' && nextChar === '*') {
                    inBlockComment = true;
                    i++;
                    continue;
                }
            }

            if (escape) {
                escape = false;
                continue;
            }

            if (char === '\\') {
                escape = true;
                continue;
            }

            if (char === '"' && !inChar) {
                inString = !inString;
                continue;
            }
            if (char === "'" && !inString) {
                inChar = !inChar;
                continue;
            }

            if (!inString && !inChar) {
                if (char === '{') braceBalance++;
                if (char === '}') braceBalance--;
            }
            
            if (braceBalance < 0) return "Syntax Error: Unexpected closing brace '}' found.";
        }

        if (braceBalance !== 0) return `Syntax Error: Unbalanced braces. Found ${Math.abs(braceBalance)} missing ${braceBalance > 0 ? 'closing' : 'opening'} brace(s).`;
        
        return null;
    };

    // --- EXECUTION API ---
    const executePiston = async (sourceCode: string, stdin: string): Promise<PistonResponse> => {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'java',
                version: '15.0.2',
                files: [{ name: 'Main.java', content: sourceCode }],
                stdin: stdin,
                run_timeout: 3000,
            })
        });
        if (!response.ok) throw new Error("Execution Service Unavailable");
        return await response.json();
    };

    const prepareSource = (userCode: string) => {
        if (!problem?.driverCode) return userCode; // Fallback for playground
        return problem.driverCode.replace('// USER_CODE_HERE', userCode);
    };

    // --- RUN SINGLE TESTCASE ---
    const handleRun = async () => {
        setIsRunning(true);
        setConsoleState('open');
        setSubmissionResult(null); // Clear submission view
        
        try {
            // 1. Validation
            const validationError = validateJavaCode(code);
            if (validationError) {
                throw new Error(validationError);
            }

            const inputToRun = isCustomMode ? customInput : problem?.testCases[activeTestCaseId].input || '';
            const fullSource = prepareSource(code);
            
            const res = await executePiston(fullSource, inputToRun);
            
            // Parse Result
            const isError = res.run.code !== 0 || (res.compile && res.compile.code !== 0);
            const output = res.run.stdout.trim();
            const stderr = res.run.stderr || res.compile?.stderr || '';
            
            // If not custom, compare with expected
            let passed = undefined;
            let expected = undefined;
            
            if (!isCustomMode && problem) {
                expected = problem.testCases[activeTestCaseId].expectedOutput.trim();
                passed = !isError && output === expected;
            }

            setExecutionResult({
                type: 'run',
                input: inputToRun,
                output,
                error: isError ? stderr : null,
                passed,
                expected
            });

        } catch (e: any) {
            setExecutionResult({ 
                type: 'run',
                error: e.message || "Network Error",
                passed: false 
            });
        } finally {
            setIsRunning(false);
        }
    };

    // --- SUBMIT ALL TESTCASES ---
    const handleSubmit = async () => {
        if (!problem) return;
        setIsRunning(true);
        setConsoleState('open');
        setExecutionResult(null); // Clear single run view

        try {
            // 1. Validation
            const validationError = validateJavaCode(code);
            if (validationError) {
                throw new Error(validationError);
            }

            const fullSource = prepareSource(code);
            const results = [];
            let allPassed = true;

            // Limit submission to first 5 cases to avoid timeout/spamming public API in this demo
            const casesToRun = problem.testCases.slice(0, 5); 

            for (let i = 0; i < casesToRun.length; i++) {
                const tc = casesToRun[i];
                const res = await executePiston(fullSource, tc.input);
                
                const output = res.run.stdout.trim();
                const expected = tc.expectedOutput.trim();
                const isError = res.run.code !== 0;
                const passed = !isError && output === expected;

                if (!passed) allPassed = false;

                results.push({
                    id: i,
                    input: tc.input,
                    output,
                    expected,
                    passed,
                    error: res.run.stderr || res.compile?.stderr
                });
            }

            setSubmissionResult({
                passed: allPassed,
                total: casesToRun.length,
                passedCount: results.filter(r => r.passed).length,
                cases: results
            });

            if (allPassed && onSolve) onSolve();

        } catch (e: any) {
            setExecutionResult({ 
                type: 'run',
                error: "Submission Error: " + (e.message || "Unknown error"),
                passed: false 
            });
        } finally {
            setIsRunning(false);
        }
    };

    // --- AI ASSISTANT ---
    const handleAskAI = () => {
        setShowAi(true);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!problem || !aiInput.trim()) return;

        const userMsg = aiInput.trim();
        setAiInput('');
        
        // Add user message to local history
        const newHistory = [...aiChat, { role: 'user' as const, text: userMsg }];
        setAiChat(newHistory);
        setIsAiLoading(true);

        try {
            const response = await generateCodeAssistance(
                code, 
                executionResult?.output || "", 
                executionResult?.error || "",
                problem.title,
                newHistory, 
                userMsg 
            );
            
            setAiChat(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
            setAiChat(prev => [...prev, { role: 'model', text: "AI Assistant is temporarily unavailable." }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- HELPERS ---
    const DifficultyBadge = ({ level }: { level: string }) => {
        return (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-graphite-text-muted border border-slate-200 dark:border-graphite-border px-2 py-0.5 rounded">
                {level}
            </span>
        );
    };

    const getOutputPanelHeight = () => {
        if (consoleState === 'closed') return '36px';
        if (consoleState === 'maximized') return '80%';
        return `${outputHeight}px`;
    };

    if (!problem) return <div className="p-8 text-center text-slate-400 dark:text-graphite-text-muted">Problem context missing.</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-graphite-base text-slate-800 dark:text-graphite-text-main font-sans overflow-hidden">
            
            {/* 1. NAVBAR */}
            <header className="h-14 border-b border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-graphite-text-muted dark:hover:text-graphite-text-main transition-colors mr-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        <h1 className="font-bold text-sm text-slate-800 dark:text-graphite-text-main tracking-tight truncate max-w-[200px] md:max-w-none">{problem.title}</h1>
                    </div>
                </div>

                {/* INJECTED HEADER CONTENT */}
                {headerContent && (
                    <div className="flex-1 flex justify-center px-4">
                        {headerContent}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded bg-slate-100 dark:bg-graphite-secondary hover:bg-slate-200 dark:hover:bg-graphite-input border border-slate-200 dark:border-graphite-border text-xs font-bold text-slate-700 dark:text-graphite-text-main transition-all ${isRunning ? 'opacity-50' : ''}`}
                    >
                        <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Run
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded bg-indigo-600 dark:bg-graphite-input hover:bg-indigo-700 dark:hover:bg-graphite-border border border-transparent dark:border-graphite-border text-white dark:text-graphite-text-main text-xs font-bold transition-all ${isRunning ? 'opacity-50' : ''}`}
                    >
                        {isRunning ? <span className="animate-spin">⟳</span> : <svg className="w-3 h-3 text-white dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                        Submit
                    </button>
                    <button 
                        onClick={handleAskAI}
                        className="p-1.5 ml-2 rounded bg-indigo-50 dark:bg-graphite-secondary text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-graphite-input transition-colors border border-indigo-100 dark:border-graphite-border"
                        title="AI Assistant"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                </div>
            </header>

            {/* 2. WORKSPACE SPLIT */}
            <div className="flex-1 flex overflow-hidden relative flex-col md:flex-row">
                {/* --- LEFT PANEL --- */}
                <div className="flex flex-col bg-white dark:bg-graphite-surface min-w-0 border-r border-slate-200 dark:border-graphite-border" style={{ width: window.innerWidth >= 768 ? `${leftPanelWidth}%` : '100%', height: window.innerWidth < 768 ? '50%' : 'auto' }}>
                    {/* Tabs */}
                    <div className="flex items-center bg-white dark:bg-graphite-surface border-b border-slate-200 dark:border-graphite-border">
                        <button 
                            onClick={() => setActiveLeftTab('description')}
                            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${activeLeftTab === 'description' ? 'border-indigo-600 dark:border-graphite-text-main text-indigo-600 dark:text-graphite-text-main' : 'border-transparent text-slate-500 dark:text-graphite-text-muted hover:text-slate-700 dark:hover:text-graphite-text-sub'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Description
                        </button>
                        <button 
                            onClick={() => setActiveLeftTab('testcases')}
                            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${activeLeftTab === 'testcases' ? 'border-indigo-600 dark:border-graphite-text-main text-indigo-600 dark:text-graphite-text-main' : 'border-transparent text-slate-500 dark:text-graphite-text-muted hover:text-slate-700 dark:hover:text-graphite-text-sub'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            Testcases
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-graphite-surface">
                        {activeLeftTab === 'description' ? (
                            <div className="prose prose-sm max-w-none text-slate-600 dark:text-graphite-text-sub">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main m-0">{problem.title}</h2>
                                    <DifficultyBadge level={problem.difficulty} />
                                </div>
                                <div className="text-slate-600 dark:text-graphite-text-sub text-sm leading-relaxed">
                                    <MarkdownRenderer content={problem.description} />
                                </div>
                                
                                <div className="mt-8">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted mb-3">Constraints</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-graphite-text-muted text-xs">
                                        {problem.constraints.split('\n').map((c, i) => <li key={i}>{c.replace(/^- /, '')}</li>)}
                                    </ul>
                                </div>

                                <div className="mt-8 space-y-6">
                                    {problem.examples.map((ex, i) => (
                                        <div key={i} className="bg-white dark:bg-graphite-secondary rounded-xl p-4 border border-slate-200 dark:border-graphite-border">
                                            <p className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted mb-2">Example {i + 1}</p>
                                            <div className="space-y-2 font-mono text-xs">
                                                <div>
                                                    <span className="text-slate-500 dark:text-graphite-text-muted select-none">Input: </span>
                                                    <span className="text-slate-800 dark:text-graphite-text-main">{ex.input.replace(/\n/g, ' ')}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 dark:text-graphite-text-muted select-none">Output: </span>
                                                    <span className="text-slate-800 dark:text-graphite-text-main">{ex.output}</span>
                                                </div>
                                                {ex.explanation && (
                                                    <div className="text-slate-500 dark:text-graphite-text-muted mt-2 italic font-sans pl-2 border-l-2 border-slate-200 dark:border-graphite-border">
                                                        {ex.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                    {problem.testCases.map((tc, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => { setActiveTestCaseId(i); setIsCustomMode(false); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${!isCustomMode && activeTestCaseId === i ? 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main border-indigo-200 dark:border-graphite-border' : 'bg-transparent text-slate-500 dark:text-graphite-text-muted border-transparent hover:text-slate-700 dark:hover:text-graphite-text-sub'}`}
                                        >
                                            Case {i + 1}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setIsCustomMode(true)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${isCustomMode ? 'bg-indigo-50 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main border-indigo-200 dark:border-graphite-border' : 'bg-transparent text-slate-500 dark:text-graphite-text-muted border-transparent hover:text-slate-700 dark:hover:text-graphite-text-sub'}`}
                                    >
                                        Custom
                                    </button>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase">Input</label>
                                        <textarea 
                                            value={isCustomMode ? customInput : problem.testCases[activeTestCaseId]?.input}
                                            onChange={(e) => isCustomMode && setCustomInput(e.target.value)}
                                            readOnly={!isCustomMode}
                                            className={`w-full h-32 bg-white dark:bg-graphite-input rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-graphite-text-main border border-slate-200 dark:border-graphite-border outline-none focus:border-indigo-500 dark:focus:border-graphite-text-muted resize-none ${!isCustomMode ? 'opacity-70 cursor-default' : ''}`}
                                        />
                                    </div>
                                    
                                    {!isCustomMode && problem.testCases[activeTestCaseId] && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase">Expected Output</label>
                                            <div className="w-full bg-white dark:bg-graphite-secondary rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-graphite-text-main border border-slate-200 dark:border-graphite-border">
                                                {problem.testCases[activeTestCaseId].expectedOutput}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- DRAG HANDLE (Desktop) --- */}
                <div 
                    className="w-1 bg-slate-100 dark:bg-graphite-base hover:bg-slate-300 dark:hover:bg-graphite-border cursor-col-resize hidden md:flex items-center justify-center group transition-colors"
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-8 w-0.5 bg-slate-300 dark:bg-graphite-border group-hover:bg-indigo-500 dark:group-hover:bg-graphite-text-muted transition-colors"></div>
                </div>

                {/* --- RIGHT PANEL --- */}
                <div className="flex-1 flex flex-col bg-white dark:bg-graphite-surface min-w-0">
                    
                    {/* Code Editor Area */}
                    <div className="flex-1 relative group bg-white dark:bg-graphite-input">
                        <div className="absolute top-0 left-0 w-12 h-full bg-slate-50 dark:bg-graphite-input border-r border-slate-200 dark:border-graphite-border text-right pr-3 pt-4 text-xs font-mono text-slate-400 dark:text-graphite-text-disabled select-none hidden sm:block">
                            {code.split('\n').map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
                        </div>
                        <textarea 
                            ref={editorRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-white dark:bg-graphite-input text-slate-800 dark:text-graphite-text-main p-4 sm:pl-16 font-mono text-xs sm:text-sm leading-6 outline-none resize-none selection:bg-indigo-100 dark:selection:bg-graphite-border"
                            spellCheck="false"
                            autoCapitalize="off"
                            autoComplete="off"
                            autoCorrect="off"
                        />
                        <div className="absolute bottom-4 right-6 text-[10px] font-bold text-slate-500 dark:text-graphite-text-muted bg-slate-100 dark:bg-graphite-secondary border border-slate-200 dark:border-graphite-border px-2 py-1 rounded pointer-events-none">
                            Java (OpenJDK 15)
                        </div>
                    </div>

                    {/* Console / Output Panel */}
                    <div 
                        className={`border-t border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface flex flex-col relative`}
                        style={{ 
                            height: getOutputPanelHeight(),
                            transition: outputDragRef.current ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}
                    >
                       <div 
                            className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize z-20 group flex justify-center items-center"
                            onMouseDown={handleOutputMouseDown}
                        >
                            <div className="w-full h-full bg-transparent group-hover:bg-slate-200/50 dark:group-hover:bg-graphite-text-muted/10 transition-colors"></div>
                        </div>

                        <div 
                            className="h-9 flex items-center justify-between px-4 bg-slate-50 dark:bg-graphite-surface border-b border-slate-200 dark:border-graphite-border cursor-pointer hover:bg-slate-100 dark:hover:bg-graphite-secondary select-none shrink-0"
                            onClick={() => setConsoleState(consoleState === 'closed' ? 'open' : 'closed')}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest">Console</span>
                                {executionResult && executionResult.type === 'run' && (
                                    <span className={`w-2 h-2 rounded-full ${executionResult.passed ? 'bg-emerald-500 dark:bg-graphite-success' : executionResult.error ? 'bg-rose-500 dark:bg-graphite-error' : 'bg-slate-300 dark:bg-graphite-text-muted'}`}></span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setConsoleState(consoleState === 'maximized' ? 'open' : 'maximized'); }}
                                    className="text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main"
                                    title={consoleState === 'maximized' ? 'Restore' : 'Maximize'}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                </button>
                                <svg className={`w-4 h-4 text-slate-400 dark:text-graphite-text-muted transform transition-transform ${consoleState === 'closed' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                            </div>
                        </div>

                        {consoleState !== 'closed' && (
                            <div className="flex-1 overflow-y-auto p-0 font-mono text-xs bg-white dark:bg-graphite-surface text-slate-800 dark:text-graphite-text-main relative">
                                {!isRunning && !executionResult && !submissionResult && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-graphite-text-muted select-none">
                                        <p>Run or submit to see output.</p>
                                    </div>
                                )}
                                {isRunning && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/50 dark:bg-graphite-surface/50 backdrop-blur-sm z-10">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-bounce delay-150"></div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-graphite-text-sub uppercase tracking-wider">Running test cases...</p>
                                    </div>
                                )}
                                {!isRunning && executionResult && executionResult.type === 'run' && (
                                    <div className="p-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted mb-4 border-b border-slate-200 dark:border-graphite-border pb-2">Run Result</h3>
                                        {executionResult.error ? (
                                            <div className="space-y-2">
                                                <div className="text-rose-600 dark:text-graphite-error font-bold">Runtime Error</div>
                                                <div className="bg-rose-50 dark:bg-graphite-secondary p-3 rounded text-rose-700 dark:text-graphite-error whitespace-pre-wrap font-mono border border-rose-100 dark:border-graphite-border">
                                                    {executionResult.error}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className={`text-sm font-bold flex items-center gap-2 ${executionResult.passed ? 'text-emerald-600 dark:text-graphite-success' : 'text-rose-600 dark:text-graphite-error'}`}>
                                                    {executionResult.passed ? '✔ Testcase Passed' : '✘ Wrong Answer'}
                                                </div>
                                                <div className="grid gap-4">
                                                    <div>
                                                        <div className="text-slate-400 dark:text-graphite-text-muted mb-1 text-[10px] uppercase tracking-wider">Input</div>
                                                        <div className="bg-slate-50 dark:bg-graphite-input p-3 rounded border border-slate-200 dark:border-graphite-border text-slate-700 dark:text-graphite-text-main">{executionResult.input}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-400 dark:text-graphite-text-muted mb-1 text-[10px] uppercase tracking-wider">Your Output</div>
                                                        <div className={`bg-slate-50 dark:bg-graphite-input p-3 rounded border text-slate-700 dark:text-graphite-text-main ${executionResult.passed ? 'border-slate-200 dark:border-graphite-border' : 'border-rose-200 dark:border-graphite-error/30'}`}>{executionResult.output}</div>
                                                    </div>
                                                    {executionResult.expected && (
                                                        <div>
                                                            <div className="text-slate-400 dark:text-graphite-text-muted mb-1 text-[10px] uppercase tracking-wider">Expected Output</div>
                                                            <div className="bg-slate-50 dark:bg-graphite-input p-3 rounded border border-slate-200 dark:border-graphite-border text-slate-700 dark:text-graphite-text-main">{executionResult.expected}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!isRunning && submissionResult && (
                                    <div className="flex flex-col h-full">
                                        <div className={`px-6 py-4 border-b border-slate-200 dark:border-graphite-border ${submissionResult.passed ? 'bg-emerald-50/50 dark:bg-graphite-secondary' : 'bg-rose-50/50 dark:bg-graphite-secondary'}`}>
                                            <h3 className={`text-lg font-black tracking-tight ${submissionResult.passed ? 'text-emerald-600 dark:text-graphite-success' : 'text-rose-600 dark:text-graphite-error'}`}>
                                                {submissionResult.passed ? 'Accepted' : 'Wrong Answer'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-graphite-text-muted uppercase tracking-widest mt-1">
                                                {submissionResult.passedCount} / {submissionResult.total} Testcases Passed
                                            </p>
                                        </div>
                                        <div className="p-6 space-y-1">
                                            {submissionResult.cases.map((res: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded hover:bg-slate-50 dark:hover:bg-graphite-secondary transition-colors border-b border-slate-100 dark:border-graphite-border last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-400 dark:text-graphite-text-muted font-bold w-4">#{i+1}</span>
                                                        <span className={`font-bold ${res.passed ? 'text-emerald-600 dark:text-graphite-success' : 'text-rose-600 dark:text-graphite-error'}`}>
                                                            {res.passed ? 'Passed' : res.error ? 'Runtime Error' : 'Failed'}
                                                        </span>
                                                    </div>
                                                    {!res.passed && (
                                                        <div className="text-[10px] text-slate-400 dark:text-graphite-text-muted font-mono">
                                                            {res.error ? 'Error' : `Exp: ${res.expected.substring(0,10)}...`}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Modal ... */}
            {showAi && (
                <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-graphite-surface border-l border-slate-200 dark:border-graphite-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-slate-200 dark:border-graphite-border flex justify-between items-center bg-white dark:bg-graphite-surface">
                        <h3 className="font-bold text-slate-800 dark:text-graphite-text-main flex items-center gap-2">
                            <span className="text-xl">✨</span> AI Coach
                        </h3>
                        <button onClick={() => setShowAi(false)} className="text-slate-400 dark:text-graphite-text-muted hover:text-slate-600 dark:hover:text-graphite-text-main"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    
                    <div ref={aiScrollRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar font-sans bg-white dark:bg-graphite-surface space-y-4">
                        {aiChat.length === 0 ? (
                            <div className="text-center text-slate-400 dark:text-graphite-text-muted text-sm mt-10">
                                Ask for a hint, approach, or debug help.<br/>
                                <span className="text-xs opacity-70">Example: "What data structure should I use?"</span>
                            </div>
                        ) : (
                            aiChat.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-2xl text-xs sm:text-sm ${msg.role === 'user' ? 'bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-tr-sm' : 'bg-slate-100 dark:bg-graphite-secondary text-slate-700 dark:text-graphite-text-main rounded-tl-sm'}`}>
                                        <MarkdownRenderer content={msg.text} />
                                    </div>
                                </div>
                            ))
                        )}
                        {isAiLoading && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-graphite-border bg-white dark:bg-graphite-surface">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-graphite-input border border-slate-200 dark:border-graphite-border rounded-xl text-sm outline-none focus:border-indigo-500 dark:focus:border-graphite-text-sub dark:text-graphite-text-main transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={!aiInput.trim() || isAiLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JavaCompiler;
