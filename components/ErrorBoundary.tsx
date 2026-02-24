import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Clear potentially corrupted localStorage data
    try {
      const corruptedKeys = [
        'study_ai_student_profile',
        'study_ai_progress',
        'study_ai_sessions'
      ];
      
      corruptedKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) JSON.parse(data); // Test if parseable
        } catch {
          console.warn(`Removing corrupted localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Could not clean localStorage:', e);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Force page reload to ensure clean state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-graphite-base p-6">
          <div className="max-w-md w-full bg-white dark:bg-graphite-surface rounded-2xl shadow-xl border border-slate-200 dark:border-graphite-border p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-graphite-text-main mb-3">
              Something went wrong
            </h2>
            
            <p className="text-sm text-slate-600 dark:text-graphite-text-muted mb-6">
              The application encountered an unexpected error. Your data has been preserved and the issue has been logged.
            </p>
            
            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-slate-50 dark:bg-graphite-base rounded-lg">
                <summary className="text-xs font-medium text-slate-700 dark:text-graphite-text-sub cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-xs text-slate-600 dark:text-graphite-text-muted mt-2 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-indigo-600 dark:bg-graphite-action text-white dark:text-graphite-base py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-graphite-text-main transition-colors"
              >
                Restart Application
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-100 dark:bg-graphite-input text-slate-700 dark:text-graphite-text-main py-3 px-4 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-graphite-secondary transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;