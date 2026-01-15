import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for OTP timer with localStorage persistence
 * Timer persists across page reloads and window closes
 * @param {string} storageKey - Unique key for localStorage (e.g., 'login_otp_timer', 'register_otp_timer')
 * @param {number} duration - Timer duration in seconds (default: 300 = 5 minutes)
 * @returns {object} { timeRemaining, isTimerActive, startTimer, resetTimer, formatTime }
 */
const useOTPTimer = (storageKey, duration = 300) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const storedEndTime = localStorage.getItem(storageKey);

    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      if (remaining > 0) {
        setTimeRemaining(remaining);
        setIsTimerActive(true);
      } else {
        // Timer expired, clean up
        localStorage.removeItem(storageKey);
        setTimeRemaining(0);
        setIsTimerActive(false);
      }
    }
  }, [storageKey]);

  // Countdown effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      const storedEndTime = localStorage.getItem(storageKey);

      if (!storedEndTime) {
        setIsTimerActive(false);
        setTimeRemaining(0);
        return;
      }

      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      if (remaining <= 0) {
        // Timer finished
        localStorage.removeItem(storageKey);
        setTimeRemaining(0);
        setIsTimerActive(false);
        clearInterval(intervalId);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerActive, timeRemaining, storageKey]);

  // Start timer
  const startTimer = useCallback(() => {
    const endTime = Date.now() + duration * 1000;
    localStorage.setItem(storageKey, endTime.toString());
    setTimeRemaining(duration);
    setIsTimerActive(true);
  }, [storageKey, duration]);

  // Reset timer (clear localStorage and state)
  const resetTimer = useCallback(() => {
    localStorage.removeItem(storageKey);
    setTimeRemaining(0);
    setIsTimerActive(false);
  }, [storageKey]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeRemaining,
    isTimerActive,
    startTimer,
    resetTimer,
    formatTime,
  };
};

export default useOTPTimer;
