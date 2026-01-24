
import React, { useState, useMemo } from 'react';
import { SkillDataPoint } from '../types';

interface SkillGraphProps {
  data: SkillDataPoint[];
}

interface PlotPoint extends SkillDataPoint {
  x: number;
  y: number;
}

const SkillGraph: React.FC<SkillGraphProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<PlotPoint | null>(null);

  // Filter & Sort Data
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Filter valid data
  const validData = sortedData.filter(d => typeof d.score === 'number' && !isNaN(d.score) && d.score >= 0 && d.score <= 100);

  if (!validData || validData.length < 2) {
    return (
      <div className="bg-white dark:bg-graphite-surface p-8 rounded-[2rem] border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col items-center justify-center text-center h-64">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-indigo-400 dark:text-graphite-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-graphite-text-main">Not Enough Data</h3>
        <p className="text-xs text-slate-500 dark:text-graphite-text-sub mt-1">Complete at least 2 quizzes to see your trend.</p>
      </div>
    );
  }

  // Graph Dimensions
  const width = 600;
  const height = 250;
  const padding = 30;
  const graphHeight = height - padding * 2;
  const graphWidth = width - padding * 2;

  // plotting
  const points: PlotPoint[] = validData.map((d, i) => {
    const x = padding + (i / (validData.length - 1)) * graphWidth;
    const y = height - padding - (d.score / 100) * graphHeight;
    return { x, y, ...d };
  });

  // SVG Path (Smooth Bezier)
  const createPath = (pts: PlotPoint[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createPath(points);
  const areaPath = `${linePath} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="bg-white dark:bg-graphite-surface p-6 rounded-[2.5rem] border border-slate-200 dark:border-graphite-border shadow-sm flex flex-col h-full relative group">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-lg font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Understanding Trajectory</h3>
         <span className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted bg-slate-50 dark:bg-graphite-secondary px-2 py-1 rounded-lg">Last 30 Days</span>
      </div>

      <div className="relative w-full aspect-[2.5/1]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
           <defs>
            <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" className="text-indigo-600 dark:text-graphite-text-main" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" className="text-indigo-600 dark:text-graphite-text-main" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map(tick => {
             const y = height - padding - (tick / 100) * graphHeight;
             return (
                <g key={tick}>
                   <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-slate-100 dark:text-graphite-border" strokeDasharray="4 4" />
                   <text x={padding - 10} y={y + 3} className="text-[9px] fill-slate-300 dark:fill-graphite-text-muted font-mono" textAnchor="end">{tick}</text>
                </g>
             )
          })}

          {/* Graph */}
          <path d={areaPath} fill="url(#skillGradient)" />
          <path d={linePath} fill="none" stroke="currentColor" className="text-indigo-600 dark:text-graphite-text-main" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, i) => (
             <circle 
                key={i} 
                cx={p.x} cy={p.y} r="4" 
                className="fill-white stroke-indigo-600 dark:fill-graphite-base dark:stroke-graphite-text-main stroke-2 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
             />
          ))}

          {/* Hover Tooltip in SVG */}
          {hoveredPoint && (
             <g>
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" className="fill-indigo-600 dark:fill-graphite-text-main" />
                <foreignObject x={hoveredPoint.x - 60} y={hoveredPoint.y - 60} width="120" height="50">
                   <div className="bg-slate-800 text-white dark:bg-graphite-secondary dark:text-graphite-text-main dark:border dark:border-graphite-border text-[10px] p-2 rounded-lg shadow-lg text-center">
                      <div className="font-bold">{hoveredPoint.score}% Score</div>
                      <div className="text-slate-400 dark:text-graphite-text-sub">{new Date(hoveredPoint.date).toLocaleDateString()}</div>
                   </div>
                </foreignObject>
             </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default SkillGraph;
