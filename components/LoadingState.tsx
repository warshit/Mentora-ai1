
import React, { useState, useEffect } from 'react';

// --- PRIMITIVES ---

export const PulseLoader = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-[bounce_1s_infinite]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-graphite-action rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
  </div>
);

const LOADING_MESSAGES = [
  "Analyzing context...",
  "Structuring knowledge...",
  "Synthesizing key concepts...",
  "Optimizing for clarity...",
  "Applying learning model...",
  "Almost ready..."
];

export const DynamicStatusText = ({ context, small = false }: { context?: string, small?: boolean }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 animate-in fade-in duration-500">
      <p className={`${small ? 'text-[10px]' : 'text-xs'} font-black text-slate-500 dark:text-graphite-text-sub uppercase tracking-widest`}>
        {LOADING_MESSAGES[index]}
      </p>
      {context && <p className="text-[10px] text-slate-400 dark:text-graphite-text-muted font-mono">{context}</p>}
    </div>
  );
};

export const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }: { width?: string, height?: string, className?: string }) => (
  <div className={`${width} ${height} bg-slate-200 dark:bg-graphite-border rounded-lg animate-pulse ${className}`}></div>
);

// --- COMPOSITE LOADERS ---

export const TopicContentSkeleton = () => (
  <div className="space-y-10 animate-in fade-in duration-500 w-full">
    {/* Header Skeleton */}
    <div className="space-y-4">
      <SkeletonLine width="w-1/3" height="h-8" /> 
      <SkeletonLine width="w-2/3" height="h-4" className="opacity-60" />
    </div>

    {/* Paragraphs Skeleton */}
    <div className="space-y-3">
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine width="w-5/6" />
      <SkeletonLine width="w-4/6" />
    </div>

    {/* Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
       <div className="h-40 bg-slate-100 dark:bg-graphite-secondary rounded-[2rem] animate-pulse border border-slate-200 dark:border-graphite-border"></div>
       <div className="h-40 bg-slate-100 dark:bg-graphite-secondary rounded-[2rem] animate-pulse border border-slate-200 dark:border-graphite-border"></div>
    </div>
    
    {/* Footer Text */}
    <div className="flex justify-center pt-8 opacity-60">
       <DynamicStatusText />
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
    <div className="bg-white dark:bg-graphite-secondary p-5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-graphite-border shadow-sm w-3/4">
       <div className="space-y-2.5">
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-5/6" height="h-3" />
          <SkeletonLine width="w-4/6" height="h-3" />
       </div>
    </div>
    <div className="mt-3 ml-2 flex items-center gap-2">
       <PulseLoader />
       <span className="text-[10px] font-bold text-slate-400 dark:text-graphite-text-muted uppercase tracking-wider">AI is typing...</span>
    </div>
  </div>
);

export const LoadingOverlay = ({ message, isVisible }: { message?: string, isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-graphite-base/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="bg-white dark:bg-graphite-surface p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-graphite-border flex flex-col items-center gap-8 max-w-sm w-full transform transition-all hover:scale-105">
          
          {/* Visual Indicator */}
          <div className="relative w-20 h-20 flex items-center justify-center">
             <div className="absolute inset-0 border-4 border-slate-100 dark:border-graphite-border rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 dark:border-graphite-action rounded-full border-t-transparent animate-spin [animation-duration:1.5s]"></div>
             <div className="w-3 h-3 bg-indigo-600 dark:bg-graphite-action rounded-full animate-pulse"></div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
             <h3 className="text-xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Processing</h3>
             <DynamicStatusText context={message} />
          </div>
       </div>
    </div>
  );
};
