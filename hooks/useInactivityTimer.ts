import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // in milliseconds
  onTimeout: () => void;
  onWarning?: () => void;
  warningTime?: number; // warning time before timeout (in milliseconds)
  enabled?: boolean; // whether the timer is enabled
}

export const useInactivityTimer = ({
  timeout,
  onTimeout,
  onWarning,
  warningTime = 15000, // 15 seconds warning by default
  enabled = true
}: UseInactivityTimerProps) => {
  const [isActive, setIsActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Add pause state
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled || isPaused) {
      console.log('🚫 Timer reset blocked - paused or disabled');
      return;
    }
    
    console.log('🔄 Inactivity timer reset');
    lastActivityRef.current = Date.now();
    setIsActive(true);
    setShowWarning(false);
    setTimeLeft(0);
    setIsPaused(false); // Reset pause state when timer resets

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timer
    if (onWarning && warningTime > 0) {
      console.log(`⏰ Setting warning timer for ${(timeout - warningTime) / 1000}s`);
      warningTimeoutRef.current = setTimeout(() => {
        console.log('🚨 Warning timer triggered - pausing activity detection');
        setShowWarning(true);
        setIsPaused(true); // Pause activity detection when warning shows
        setTimeLeft(Math.ceil(warningTime / 1000));
        onWarning();

        // Start countdown
        countdownRef.current = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            console.log(`⏳ Countdown: ${newTime}s`);
            if (newTime <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return 0;
            }
            return newTime;
          });
        }, 1000);
      }, timeout - warningTime);
    }

    // Set main timeout
    console.log(`⏰ Setting main timeout for ${timeout / 1000}s`);
    timeoutRef.current = setTimeout(() => {
      console.log('💀 Main timeout triggered - logging out');
      setIsActive(false);
      setShowWarning(false);
      setIsPaused(false);
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, onWarning, warningTime, enabled, isPaused]);

  const pauseTimer = useCallback(() => {
    console.log('⏸️ Timer paused');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resumeTimer = useCallback(() => {
    if (isActive && enabled) {
      console.log('▶️ Timer resumed');
      resetTimer();
    }
  }, [isActive, resetTimer, enabled]);

  useEffect(() => {
    if (!enabled) {
      console.log('❌ Inactivity timer disabled');
      return;
    }

    console.log('✅ Inactivity timer enabled');
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = (event: Event) => {
      // Don't reset timer if the event is from the warning modal
      const target = event.target as Element;
      if (target && target.closest('[data-inactivity-modal]')) {
        console.log(`🚫 Ignoring activity from modal: ${event.type}`);
        return;
      }
      
      console.log(`👆 Activity detected: ${event.type}`);
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up inactivity timer');
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, enabled]);

  // Handle page visibility changes
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Page hidden - pausing timer');
        pauseTimer();
      } else {
        console.log('👁️ Page visible - resuming timer');
        resumeTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseTimer, resumeTimer, enabled]);

  return {
    isActive,
    showWarning: enabled ? showWarning : false,
    timeLeft: enabled ? timeLeft : 0,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isPaused
  };
};