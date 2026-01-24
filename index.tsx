import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Global Error Boundary for Black Screen Recovery
class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicit property declarations to fix TS errors regarding missing properties on 'this'
  state: ErrorBoundaryState = { hasError: false, error: null };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CRITICAL APP CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-rose-100">
            <h1 className="text-2xl font-black text-rose-600 mb-4 tracking-tight">System Recovery Mode</h1>
            <p className="text-slate-500 mb-6 font-medium text-sm leading-relaxed">
              The AI Companion encountered a critical rendering error. Safe mode has been activated to protect your data.
            </p>
            <div className="bg-slate-100 p-4 rounded-xl text-xs font-mono text-slate-600 mb-6 overflow-auto text-left border border-slate-200">
              {this.state.error?.message || "Unknown rendering error"}
            </div>
            <button 
              onClick={() => {
                localStorage.clear(); 
                window.location.reload();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest"
            >
              Reset Cache & Reboot
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);