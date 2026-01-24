
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  
  // Helper to process inline formatting (bold, inline code)
  const processInline = (text: string) => {
    let processed = text
      // Escape HTML
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // Bold **text** -> Semantic Strong with moderate weight
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-graphite-text-main">$1</strong>')
      // Italic *text* -> Semantic Emphasis
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-graphite-text-sub font-serif">$1</em>')
      // Inline Code `text`
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-graphite-secondary text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-mono text-[0.85em] border border-slate-200 dark:border-graphite-border font-medium">$1</code>');
    
    return { __html: processed };
  };

  // 1. Split content by Code Blocks (```...```)
  const parts = content.split(/(```[\s\S]*?```)/g);

  // Default typography if no className provided
  const typoClasses = className || "text-base md:text-lg leading-loose";

  return (
    <div className={`markdown-renderer-container ${typoClasses} space-y-6 font-sans text-slate-700 dark:text-graphite-text-sub font-feature-settings`}>
      {parts.map((part, index) => {
        // --- RENDER CODE BLOCK ---
        if (part.startsWith('```')) {
          // Extract language (optional) and code
          const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.replace(/```/g, '');

          return (
            <div key={index} className="my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-graphite-border shadow-sm bg-[#1e1e1e] dark:bg-[#0A0A0A] font-sans">
              {lang && (
                <div className="px-4 py-2 bg-[#2d2d2d] dark:bg-[#121212] border-b border-white/10 text-[10px] font-mono text-slate-300 uppercase tracking-wider flex justify-between select-none">
                  <span>{lang}</span>
                  <span>Code</span>
                </div>
              )}
              <pre className="p-5 overflow-x-auto custom-scrollbar">
                <code className="font-mono text-sm text-[#d4d4d4] leading-relaxed block min-w-full">
                  {code.trim()}
                </code>
              </pre>
            </div>
          );
        }

        // --- RENDER TEXT CONTENT (Headers, Lists, Paragraphs) ---
        // Split by newlines to handle line-by-line formatting
        const lines = part.split('\n');
        const renderedLines: React.ReactNode[] = [];
        let currentList: React.ReactNode[] = [];
        let inList = false;

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return; // Skip empty lines

          // H3 Headers - Subsections
          if (trimmed.startsWith('### ')) {
            if (inList) { renderedLines.push(<ul key={`list-${index}-${lineIdx}`} className="list-disc ml-5 mb-5 space-y-2 marker:text-slate-400 dark:marker:text-graphite-text-muted">{[...currentList]}</ul>); currentList = []; inList = false; }
            renderedLines.push(
                <h3 key={`${index}-${lineIdx}`} className="text-lg font-bold text-slate-800 dark:text-graphite-text-main mt-8 mb-3 tracking-tight font-serif">
                    {trimmed.replace('### ', '')}
                </h3>
            );
          }
          // H2 Headers - Major Sections
          else if (trimmed.startsWith('## ')) {
            if (inList) { renderedLines.push(<ul key={`list-${index}-${lineIdx}`} className="list-disc ml-5 mb-5 space-y-2 marker:text-slate-400 dark:marker:text-graphite-text-muted">{[...currentList]}</ul>); currentList = []; inList = false; }
            renderedLines.push(
                <h2 key={`${index}-${lineIdx}`} className="text-2xl font-bold text-slate-900 dark:text-graphite-text-main mt-10 mb-5 pb-2 border-b border-slate-100 dark:border-graphite-border font-serif tracking-tight">
                    {trimmed.replace('## ', '')}
                </h2>
            );
          }
          // Lists
          else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true;
            currentList.push(
              <li key={`li-${index}-${lineIdx}`} className="pl-1 text-slate-700 dark:text-graphite-text-sub leading-relaxed">
                <span dangerouslySetInnerHTML={processInline(trimmed.substring(2))} />
              </li>
            );
          }
          // Numbered Lists
          else if (/^\d+\.\s/.test(trimmed)) {
             const content = trimmed.replace(/^\d+\.\s/, '');
             renderedLines.push(
               <div key={`${index}-${lineIdx}`} className="flex gap-4 mb-3 ml-1">
                 <span className="font-semibold text-slate-500 dark:text-graphite-text-muted text-base mt-0.5 min-w-[20px] font-mono">{trimmed.match(/^\d+\./)![0]}</span>
                 <p className="flex-1 text-slate-700 dark:text-graphite-text-sub leading-relaxed" dangerouslySetInnerHTML={processInline(content)} />
               </div>
             );
          }
          // Paragraphs
          else {
            if (inList) { 
              renderedLines.push(<ul key={`list-${index}-${lineIdx}`} className="list-disc ml-5 mb-5 space-y-2 marker:text-slate-400 dark:marker:text-graphite-text-muted">{[...currentList]}</ul>); 
              currentList = []; 
              inList = false; 
            }
            // Check for Horizontal Rule
            if (trimmed === '---') {
                renderedLines.push(<hr key={`${index}-${lineIdx}`} className="my-8 border-slate-200 dark:border-graphite-border" />);
            } else {
                renderedLines.push(
                  <p key={`${index}-${lineIdx}`} className="mb-5 text-slate-700 dark:text-graphite-text-sub font-normal leading-loose" dangerouslySetInnerHTML={processInline(trimmed)} />
                );
            }
          }
        });

        // Flush remaining list
        if (inList) {
           renderedLines.push(<ul key={`list-end-${index}`} className="list-disc ml-5 mb-5 space-y-2 marker:text-slate-400 dark:marker:text-graphite-text-muted">{[...currentList]}</ul>);
        }

        return <div key={index}>{renderedLines}</div>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
