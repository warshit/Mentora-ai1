
import React, { useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Message, LearningMode, DoubtType, LearningCategory } from '../types';
import { ChatMessageSkeleton } from './LoadingState';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  category: LearningCategory;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, category }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUpskill = category === LearningCategory.UPSKILL;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const getBadgeStyles = (mode: LearningMode | undefined, type: DoubtType | undefined) => {
    return "text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-graphite-text-main dark:bg-graphite-secondary dark:border-graphite-border";
  };

  return (
    <div className={`flex flex-col h-full border-l shadow-xl z-30 bg-white dark:bg-graphite-surface border-slate-200 dark:border-graphite-border`}>
      <div className={`p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-graphite-secondary border-slate-200 dark:border-graphite-border`}>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-graphite-text-muted flex items-center gap-2">
          <svg className={`w-4 h-4 text-indigo-600 dark:text-graphite-text-main`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          AI Tutor
        </h3>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border bg-white dark:bg-graphite-base text-slate-500 dark:text-graphite-text-sub border-slate-200 dark:border-graphite-border`}>
          Always Active
        </span>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 bg-slate-50 dark:bg-graphite-surface`}>
        {messages.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted">Ask any doubt about this topic.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[95%] p-5 text-sm shadow-sm transition-all
                ${m.role === 'user' 
                  ? 'bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base rounded-2xl rounded-tr-sm border border-indigo-700 dark:border-graphite-border' 
                  : 'bg-white dark:bg-graphite-secondary text-slate-800 dark:text-graphite-text-main rounded-2xl rounded-tl-sm border border-slate-200 dark:border-graphite-border'}
              `}>
                 <MarkdownRenderer content={m.content} />
              </div>
              {m.role === 'assistant' && (
                <div className="mt-2 ml-1 flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-graphite-border flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-indigo-600 dark:text-graphite-text-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getBadgeStyles(m.mode, m.doubtType)}`}>
                     {m.mode !== LearningMode.UNDETERMINED ? m.mode : 'AI'}
                   </span>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <ChatMessageSkeleton />
        )}
      </div>

      <div className={`p-4 border-t bg-white dark:bg-graphite-surface border-slate-200 dark:border-graphite-border`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a follow-up question..."
            className={`w-full border-2 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none transition-all
              bg-slate-50 dark:bg-graphite-base border-slate-200 dark:border-graphite-border text-slate-800 dark:text-graphite-text-main focus:border-indigo-500 dark:focus:border-graphite-text-sub placeholder:text-slate-400 dark:placeholder:text-graphite-text-muted
            `}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
              ${!input.trim() || isLoading 
                ? 'text-slate-300 dark:text-graphite-text-disabled' 
                : 'bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base hover:scale-105 active:scale-95 shadow-sm'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
