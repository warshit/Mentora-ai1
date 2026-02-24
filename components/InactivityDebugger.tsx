import React from 'react';

interface InactivityDebuggerProps {
  isEnabled: boolean;
  showWarning: boolean;
  timeLeft: number;
  isPaused?: boolean;
}

const InactivityDebugger: React.FC<InactivityDebuggerProps> = ({
  isEnabled,
  showWarning,
  timeLeft,
  isPaused = false
}) => {
  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-sm font-mono z-[9998] max-w-xs">
      <div className="mb-2">
        <strong>🔍 Inactivity Debug</strong>
      </div>
      <div>Enabled: {isEnabled ? '✅' : '❌'}</div>
      <div>Warning: {showWarning ? '🚨 ACTIVE' : '✅ Clear'}</div>
      <div>Paused: {isPaused ? '⏸️ YES' : '▶️ NO'}</div>
      <div>Time Left: {timeLeft}s</div>
      <div className="mt-2 text-xs text-gray-300">
        <div>Timeout: 30s</div>
        <div>Warning: 10s before</div>
        <div>Check console for logs</div>
      </div>
      <div className="mt-2 text-xs text-yellow-300">
        <div>💡 Stop moving mouse to test</div>
        <div>💡 Modal interactions won't reset timer</div>
        <div>💡 Timer pauses when warning shows</div>
      </div>
    </div>
  );
};

export default InactivityDebugger;