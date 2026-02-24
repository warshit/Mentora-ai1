
import React, { useState } from 'react';
import { Subject } from '../types';
import { parseSyllabusText } from '../services/geminiService';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Subject[]) => void;
}

const SyllabusModal: React.FC<SyllabusModalProps> = ({ isOpen, onClose, onSave }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<Subject[] | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please paste syllabus content to continue.");
      return;
    }
    setError('');
    setIsAnalyzing(true);
    
    try {
      const result = await parseSyllabusText(text);
      if (result && result.length > 0) {
        setParsedData(result);
      } else {
        setError("Unable to parse syllabus. Please check the format and try again.");
      }
    } catch (e) {
      setError("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (parsedData) {
      onSave(parsedData);
      onClose();
    }
  };

  const reset = () => {
    setParsedData(null);
    setText('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-graphite-surface rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-graphite-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-graphite-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main">Syllabus Scan</h2>
            <p className="text-sm text-slate-500 dark:text-graphite-text-sub font-medium">Import your curriculum to unlock personalized tracking.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-graphite-secondary rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {!parsedData ? (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-graphite-text-muted">
                Paste Syllabus Content
              </label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your course syllabus text here (Modules, Topics, Subject Name)..."
                className="w-full h-64 p-4 rounded-xl border-2 border-slate-200 dark:border-graphite-border bg-slate-50 dark:bg-graphite-base text-sm font-medium focus:border-indigo-500 dark:focus:border-graphite-text-sub outline-none resize-none transition-all dark:text-graphite-text-main placeholder:text-slate-400 dark:placeholder:text-graphite-text-disabled"
              />
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-graphite-secondary border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-graphite-secondary border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                 <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Analysis Successful</h3>
                   <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">We found {parsedData.length} subjects and {parsedData.reduce((acc, s) => acc + s.units.length, 0)} modules.</p>
                 </div>
               </div>
               
               <div className="border border-slate-200 dark:border-graphite-border rounded-xl overflow-hidden">
                 <div className="bg-slate-50 dark:bg-graphite-secondary px-4 py-2 border-b border-slate-200 dark:border-graphite-border text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted">Preview</div>
                 <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                   {parsedData.map((sub, idx) => (
                     <div key={idx} className="p-3 border-b border-slate-100 dark:border-graphite-border last:border-0">
                       <p className="font-bold text-sm text-slate-800 dark:text-graphite-text-main">{sub.name} <span className="text-slate-400 dark:text-graphite-text-muted text-xs font-normal">({sub.code})</span></p>
                       <p className="text-xs text-slate-500 dark:text-graphite-text-sub mt-1">{sub.units.length} Modules • {sub.units.reduce((acc, u) => acc + u.topics.length, 0)} Topics</p>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-graphite-border flex justify-end gap-3 bg-slate-50 dark:bg-graphite-base rounded-b-[2rem]">
          {!parsedData ? (
             <button 
               onClick={handleAnalyze} 
               disabled={isAnalyzing}
               className={`px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${isAnalyzing ? 'opacity-70 cursor-wait' : ''}`}
             >
               {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
               {!isAnalyzing && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7m7-7H3" /></svg>}
             </button>
          ) : (
            <>
              <button onClick={reset} className="px-6 py-3 bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
                Scan Again
              </button>
              <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg">
                Save & Apply
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default SyllabusModal;
