
import React, { useState } from 'react';
import { StudySchedule, ScheduleTask } from '../types';

interface StudyPlannerProps {
  schedule: StudySchedule | null;
  onGenerate: () => void;
  onUpdateSchedule: (newSchedule: StudySchedule) => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ schedule, onGenerate, onUpdateSchedule }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);

  // --- Handlers ---

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDay: string) => {
    e.preventDefault();
    if (!schedule || !draggedTaskId) return;

    const newTasks = schedule.tasks.map(t => 
      t.id === draggedTaskId ? { ...t, day: targetDay } : t
    );

    onUpdateSchedule({ ...schedule, tasks: newTasks });
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!schedule) return;
    const newTasks = schedule.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'Completed' ? 'Planned' : 'Completed'
        } as ScheduleTask;
      }
      return t;
    });
    onUpdateSchedule({ ...schedule, tasks: newTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!schedule) return;
    const newTasks = schedule.tasks.filter(t => t.id !== taskId);
    onUpdateSchedule({ ...schedule, tasks: newTasks });
    setEditingTask(null);
  };

  const handleSaveEdit = (updatedTask: ScheduleTask) => {
    if (!schedule) return;
    const newTasks = schedule.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateSchedule({ ...schedule, tasks: newTasks });
    setEditingTask(null);
  };

  const addNewTask = (day: string) => {
    if (!schedule) return;
    const newTask: ScheduleTask = {
        id: `custom-${Date.now()}`,
        day,
        topic: "New Task",
        type: "Study",
        duration: 60,
        status: "Planned",
        subject: "General"
    };
    onUpdateSchedule({ ...schedule, tasks: [...schedule.tasks, newTask] });
    setEditingTask(newTask); // Open edit immediately
  };

  const clearSchedule = () => {
      if (confirm("Are you sure you want to clear the entire schedule?")) {
          onUpdateSchedule({ ...schedule!, tasks: [] });
      }
  };

  // --- Render Helpers ---

  const getTaskColor = (type: string, status: string) => {
    if (status === 'Completed') return "bg-slate-100 dark:bg-graphite-secondary border-slate-200 dark:border-graphite-border opacity-60";
    switch (type) {
      case 'Study': return "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-300";
      case 'Revision': return "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-300";
      case 'Practice': return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300";
      case 'Quiz': return "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-300";
      default: return "bg-white dark:bg-graphite-surface border-slate-200 dark:border-graphite-border";
    }
  };

  if (!schedule || schedule.tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-graphite-secondary rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-indigo-500 dark:text-graphite-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-graphite-text-main mb-2">No Active Plan</h2>
        <p className="text-slate-500 dark:text-graphite-text-sub text-center max-w-md mb-8">
          Let AI architect your week. Generate a structured plan based on your syllabus, weak areas, and available time.
        </p>
        <button 
          onClick={onGenerate}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          Generate Study Plan
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      </div>
    );
  }

  // Calculate Progress
  const totalTasks = schedule.tasks.length;
  const completedTasks = schedule.tasks.filter(t => t.status === 'Completed').length;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-graphite-secondary text-indigo-700 dark:text-graphite-text-main text-[10px] font-black uppercase tracking-widest rounded">Weekly Plan</span>
              <span className="text-slate-400 dark:text-graphite-text-muted text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString(undefined, {month:'long', year:'numeric'})}</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-graphite-text-main tracking-tight">Study Planner</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex-1 md:w-48">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500 dark:text-graphite-text-muted">
                 <span>Progress</span>
                 <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-graphite-secondary rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
           </div>
           <div className="flex gap-2">
              <button onClick={clearSchedule} className="p-2 text-slate-400 hover:text-rose-500 dark:text-graphite-text-muted dark:hover:text-rose-400 transition-colors" title="Clear Plan">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button onClick={onGenerate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                 Regenerate
              </button>
           </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
         <div className="grid grid-cols-7 gap-4 min-w-[1000px] h-full">
            {days.map(day => (
               <div 
                 key={day} 
                 className="flex flex-col bg-slate-50 dark:bg-graphite-base/50 rounded-2xl border border-slate-200 dark:border-graphite-border h-full"
                 onDrop={(e) => handleDrop(e, day)}
                 onDragOver={handleDragOver}
               >
                  {/* Day Header */}
                  <div className="p-3 border-b border-slate-100 dark:border-graphite-border bg-white dark:bg-graphite-surface rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                     <span className="font-black text-slate-700 dark:text-graphite-text-main text-sm">{day}</span>
                     <button onClick={() => addNewTask(day)} className="text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                     </button>
                  </div>

                  {/* Tasks List */}
                  <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                     {schedule.tasks.filter(t => t.day === day).map(task => (
                        <div 
                           key={task.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, task.id)}
                           onClick={() => setEditingTask(task)}
                           className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group relative ${getTaskColor(task.type, task.status)}`}
                        >
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{task.type}</span>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                 <button 
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 hover:border-emerald-500'}`}
                                 >
                                    {task.status === 'Completed' && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                 </button>
                              </div>
                           </div>
                           <p className={`text-xs font-bold leading-tight line-clamp-2 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                              {task.topic}
                           </p>
                           <p className="text-[9px] mt-1 opacity-60 font-mono">{task.duration}m</p>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-100">
            <div className="bg-white dark:bg-graphite-surface p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-graphite-border">
               <h3 className="text-lg font-black text-slate-900 dark:text-graphite-text-main mb-4">Edit Task</h3>
               <div className="space-y-3">
                  <div>
                     <label className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase">Topic</label>
                     <input 
                        type="text" 
                        value={editingTask.topic} 
                        onChange={(e) => setEditingTask({...editingTask, topic: e.target.value})}
                        className="w-full mt-1 p-2 bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg text-sm font-bold outline-none focus:border-indigo-500 dark:text-graphite-text-main"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase">Type</label>
                        <select 
                           value={editingTask.type}
                           onChange={(e) => setEditingTask({...editingTask, type: e.target.value as any})}
                           className="w-full mt-1 p-2 bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg text-sm font-bold outline-none dark:text-graphite-text-main"
                        >
                           <option>Study</option>
                           <option>Revision</option>
                           <option>Practice</option>
                           <option>Quiz</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 dark:text-graphite-text-muted uppercase">Duration (m)</label>
                        <input 
                           type="number" 
                           value={editingTask.duration} 
                           onChange={(e) => setEditingTask({...editingTask, duration: parseInt(e.target.value) || 0})}
                           className="w-full mt-1 p-2 bg-slate-50 dark:bg-graphite-base border border-slate-200 dark:border-graphite-border rounded-lg text-sm font-bold outline-none dark:text-graphite-text-main"
                        />
                     </div>
                  </div>
               </div>
               <div className="flex gap-2 mt-6">
                  <button onClick={() => handleDeleteTask(editingTask.id)} className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Delete</button>
                  <div className="flex-1"></div>
                  <button onClick={() => setEditingTask(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-graphite-base rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
                  <button onClick={() => handleSaveEdit(editingTask)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">Save</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default StudyPlanner;
