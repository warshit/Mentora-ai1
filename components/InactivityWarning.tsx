import React from 'react';

interface InactivityWarningProps {
  isVisible: boolean;
  timeLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const InactivityWarning: React.FC<InactivityWarningProps> = ({
  isVisible,
  timeLeft,
  onStayLoggedIn,
  onLogout
}) => {
  if (!isVisible) return null;

  // Prevent modal from triggering activity events
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleModalInteraction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200"
      data-inactivity-modal
      onClick={handleModalClick}
      onMouseMove={handleModalInteraction}
      onKeyDown={handleModalInteraction}
      onTouchStart={handleModalInteraction}
      onScroll={handleModalInteraction}
    >
      <div 
        className="bg-white dark:bg-graphite-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-graphite-border p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        data-inactivity-modal
        onClick={handleModalClick}
        onMouseMove={handleModalInteraction}
        onKeyDown={handleModalInteraction}
        onTouchStart={handleModalInteraction}
      >
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-3">
            ⚠️ Session Timeout Warning
          </h3>
          <p className="text-slate-600 dark:text-graphite-text-sub mb-4">
            You've been inactive for a while. Your session will expire in:
          </p>
          
          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-6 py-3 rounded-xl font-mono text-3xl font-bold min-w-[100px] border-2 border-red-300 dark:border-red-700">
              {timeLeft}s
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-graphite-text-muted font-medium">
            Click "Stay Logged In" to continue your session, or do nothing to logout automatically.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              handleModalInteraction(e);
              onLogout();
            }}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-graphite-secondary hover:bg-slate-200 dark:hover:bg-graphite-border text-slate-700 dark:text-graphite-text-sub font-medium rounded-xl transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={(e) => {
              handleModalInteraction(e);
              onStayLoggedIn();
            }}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-graphite-action dark:hover:bg-graphite-actionHover text-white font-medium rounded-xl transition-colors shadow-lg"
          >
            Stay Logged In
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-200 dark:bg-graphite-border rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-red-500 dark:bg-red-400 transition-all duration-1000 ease-linear"
              style={{ width: `${Math.max(0, (timeLeft / 10) * 100)}%` }}
            />
          </div>
          <div className="text-center mt-2 text-xs text-slate-500 dark:text-graphite-text-muted">
            Auto-logout in {timeLeft} seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;