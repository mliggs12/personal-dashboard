import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { useAudio } from "../../hooks/use-audio";
import FocusMode from "../focus-mode";

import Clock from "./clock";

type TimerStatus = "idle" | "running" | "paused";

interface TimerState {
  duration: number;
  startTime: string | null;
  currentTime: number;
  status: TimerStatus;
  finished?: boolean;
  focusModeActive: boolean;
  pausedTime: number; // Total time spent paused (in seconds)
  lastPauseStart: string | null; // When the current pause started
}

interface CountdownTimerProps {
  duration: number;
  timerType: "session" | "tithe";
  selectedIntention: Doc<"intentions"> | null;
  selectedIntentionId: Id<"intentions"> | null;
}

export function CountdownTimer({ 
  duration, 
  timerType, 
  selectedIntention, 
  selectedIntentionId 
}: CountdownTimerProps) {
  const timerStore = useQuery(api.timers.getActiveTimer);

  const [state, setState] = useState<TimerState>({
    duration,
    startTime: null,
    currentTime: timerType === "tithe" ? 0 : duration,
    status: "idle",
    focusModeActive: false,
    pausedTime: 0,
    lastPauseStart: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFinishedRef = useRef(false);

  const recordSession = useMutation(api.sessions.create);
  const startTimer = useMutation(api.timers.startTimer);
  const pauseTimer = useMutation(api.timers.pauseTimer);
  const resumeTimer = useMutation(api.timers.resumeTimer);
  const finishTimer = useMutation(api.timers.finishTimer);

  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  // Update local state when duration prop changes and timer is idle
  useEffect(() => {
    if (state.status === "idle") {
      setState((prevState) => ({
        ...prevState,
        duration,
        startTime: null,
        currentTime: timerType === "tithe" ? 0 : duration,
        pausedTime: 0,
        lastPauseStart: null,
      }));
      // Reset the finished flag when timer type or duration changes
      hasFinishedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, timerType]);

  const handleStart = (): void => {
    if (state.status === "running") return;

    const now = dayjs().toISOString();
    
    // Reset the finished flag when starting a new timer
    hasFinishedRef.current = false;

    setState((prevState) => ({
      ...prevState,
      startTime: now,
      status: "running",
      focusModeActive: true,
    }));

    startTimer({ 
      duration, 
      startTime: dayjs().toISOString(),
      timerType,
      intentionId: selectedIntentionId ?? undefined
    });
  };

  const handleTitheStop = (): void => {
    if (timerType === "tithe" && state.status === "running") {
      handleFinish();
    }
  };

  const handlePause = (): void => {
    setState((prevState) => {
      const now = dayjs().toISOString();
      
      if (prevState.status === "paused") {
        // Resuming: add the pause duration to total paused time
        const pauseDuration = prevState.lastPauseStart 
          ? Math.floor((Date.now() - dayjs(prevState.lastPauseStart).valueOf()) / 1000)
          : 0;
        
        // Update Convex with the accumulated pause time
        resumeTimer({ additionalPausedTime: pauseDuration });
        
        return {
          ...prevState,
          status: "running",
          pausedTime: prevState.pausedTime + pauseDuration,
          lastPauseStart: null,
          focusModeActive: timerType === "tithe" ? true : true, // Resume focus mode
        };
      } else {
        // Pausing: record when pause started
        pauseTimer({ pauseStartTime: now });
        
        return {
          ...prevState,
          status: "paused",
          lastPauseStart: now,
          focusModeActive: timerType === "tithe" ? true : false, // Tithe stays in focus, session exits
        };
      }
    });
  };

  const handleStop = (): void => {
    if (timerType === "tithe") {
      // For tithe mode, save the session and reset cleanly
      playAlarmSound();
      
      // Calculate actual active time (excluding pauses)
      const totalElapsed = Math.floor((Date.now() - dayjs(state.startTime).valueOf()) / 1000);
      let totalPausedTime = state.pausedTime;
      
      // If currently paused, add the current pause duration
      if (state.status === "paused" && state.lastPauseStart) {
        const currentPauseDuration = Math.floor((Date.now() - dayjs(state.lastPauseStart).valueOf()) / 1000);
        totalPausedTime += currentPauseDuration;
      }
      
      const activeTime = totalElapsed - totalPausedTime;
      
      const totalElapsedTime = Math.floor((Date.now() - dayjs(state.startTime).valueOf()) / 1000);
      
      // Set flag to prevent state restoration
      hasFinishedRef.current = true;
      
      // First, clear the timer interval to stop any running timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Reset to clean idle state immediately
      setState({
        duration,
        startTime: null,
        currentTime: 0,
        status: "idle",
        focusModeActive: false,
        pausedTime: 0,
        lastPauseStart: null,
      });
      
      // Then save the session and finish timer (async operations)
      recordSession({
        start: dayjs(state.startTime).valueOf(),
        end: Date.now(),
        duration: Math.max(activeTime, 0), // Active focus time
        pauseDuration: totalPausedTime, // Total paused time
        totalElapsed: totalElapsedTime, // Total wall-clock time
        timerType: timerType,
        intentionId: selectedIntentionId ?? undefined,
        description: selectedIntention?.title,
      });
      
      // Small delay to ensure local state is set before Convex update
      setTimeout(() => finishTimer(), 100);
    } else {
      // For session mode, confirm cancellation
      const confirmed = window.confirm(
        "Are you sure you want to stop this session? Your progress will be lost."
      );
      
      if (confirmed) {
        // Set flag to prevent state restoration
        hasFinishedRef.current = true;
        
        // First, clear the timer interval to stop any running timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Reset to clean idle state immediately
        setState({
          duration,
          startTime: null,
          currentTime: duration,
          status: "idle",
          focusModeActive: false,
          pausedTime: 0,
          lastPauseStart: null,
        });
        
        // Then finish timer (async operation) with small delay
        setTimeout(() => finishTimer(), 100);
      }
    }
  };

  const handleEnterFocusMode = (): void => {
    setState((prevState) => ({
      ...prevState,
      focusModeActive: true,
    }));
  };

  const handleExitFocusMode = (): void => {
    setState((prevState) => ({
      ...prevState,
      focusModeActive: false,
    }));
  };

  const handleFinish = (): void => {
    playAlarmSound();
    
    // Set flag to prevent state restoration
    hasFinishedRef.current = true;
    
    // Calculate actual active time for both modes
    const totalElapsed = Math.floor((Date.now() - dayjs(state.startTime).valueOf()) / 1000);
    let totalPausedTime = state.pausedTime;
    
    // If currently paused, add the current pause duration
    if (state.status === "paused" && state.lastPauseStart) {
      const currentPauseDuration = Math.floor((Date.now() - dayjs(state.lastPauseStart).valueOf()) / 1000);
      totalPausedTime += currentPauseDuration;
    }
    
    const activeTime = totalElapsed - totalPausedTime;
    
    const actualDuration = timerType === "tithe" 
      ? Math.max(activeTime, 0)  // For tithe, use actual active time (non-negative)
      : state.duration; // For session, use the full intended duration
    
    const totalElapsedTime = Math.floor((Date.now() - dayjs(state.startTime).valueOf()) / 1000);
    const finalPausedTime = timerType === "tithe" ? totalPausedTime : 0; // Only track pauses for tithe mode
    
    recordSession({
      start: dayjs(state.startTime).valueOf(),
      end: Date.now(),
      duration: actualDuration, // Active focus time
      pauseDuration: finalPausedTime, // Total paused time
      totalElapsed: totalElapsedTime, // Total wall-clock time
      timerType: timerType,
      intentionId: selectedIntentionId ?? undefined,
      description: selectedIntention?.title,
    });

    // Small delay to ensure local state is set before Convex update
    setTimeout(() => finishTimer(), 100);
    
    setState((prevState) => ({
      ...prevState,
      focusModeActive: false,
    }));
  };

  useEffect(() => {
    if (state.status === "running") {
      timerRef.current = setInterval(() => {
        setState((prevState) => {
          if (timerType === "session" && prevState.currentTime <= 1) {
            // Session timer finished
            if (!hasFinishedRef.current) {
              hasFinishedRef.current = true;
              clearInterval(timerRef.current as NodeJS.Timeout);
              handleFinish();
            }
            return {
              ...prevState,
              duration,
              startTime: null,
              currentTime: duration,
              status: "idle",
              focusModeActive: false,
              pausedTime: 0,
              lastPauseStart: null,
            };
          }
          
          // Update timer based on type
          const newTime = timerType === "tithe" 
            ? prevState.currentTime + 1  // Count up for tithe
            : prevState.currentTime - 1; // Count down for session
          
          return {
            ...prevState,
            currentTime: newTime,
          };
        });
      }, 1000);
      hasFinishedRef.current = false;
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [state.status, duration, timerType]);

  useEffect(() => {
    // Only restore timer state if we have a valid timer store and our local state is idle
    // Also check that the timer store actually has a running/paused timer
    // Add additional check to prevent restoration after manual stop/reset
    if (timerStore && 
        timerStore.status !== "idle" && 
        timerStore.startTime && 
        state.status === "idle" && 
        state.startTime === null &&
        !hasFinishedRef.current) { // Prevent restoration if timer was manually stopped
      
      const elapsed = Math.floor((Date.now() - dayjs(timerStore.startTime).valueOf()) / 1000);
      
      // Calculate current time based on timer type and elapsed time
      let currentTime: number;
      if (timerStore.timerType === "tithe") {
        // For tithe mode, count up from 0
        currentTime = elapsed - (timerStore.pausedTime ?? 0);
      } else {
        // For session mode, count down from duration
        const timeLeft = Math.max(timerStore.duration - elapsed + (timerStore.pausedTime ?? 0), 0);
        currentTime = timeLeft;
      }
      
      // Only restore if there's meaningful time left (for session) or any time (for tithe)
      const shouldRestore = timerStore.timerType === "tithe" || currentTime > 0;
      
      if (shouldRestore) {
        setState({
          duration: timerStore.duration,
          startTime: dayjs(timerStore.startTime).toISOString(),
          currentTime: Math.max(currentTime, 0),
          status: timerStore.status,
          focusModeActive: timerStore.status === "running", // Resume focus mode if timer was running
          pausedTime: timerStore.pausedTime ?? 0, // Restore pause tracking from Convex
          lastPauseStart: timerStore.lastPauseStart ?? null, // Restore pause start time
        });
      }
    }

  }, [timerStore?.status, timerStore?.startTime, timerStore?.timerType, state.status, state.startTime]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clear any running timer interval on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (timerStore === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <FocusMode 
        isActive={state.focusModeActive}
        intention={selectedIntention}
        timeRemaining={state.currentTime}
        timerType={timerType}
        onExit={handleExitFocusMode}
        onPause={handlePause}
        onStop={handleStop}
        isPaused={state.status === "paused"}
      />
      
      {!state.focusModeActive && (
        <div className="countdown-timer-container flex flex-col items-center p-4 border rounded-lg space-y-4">
          <Clock seconds={state.currentTime} />
          <div className="flex gap-2">
            <Button onClick={handleStart} disabled={state.status === "running"}>
              {state.status === "running" ? "Running" : state.status === "paused" ? "Resume" : "Start"}
            </Button>
            {state.status === "running" && (
              <Button onClick={handlePause} variant="outline">
                Pause
              </Button>
            )}
            {timerType === "tithe" && state.status === "running" && (
              <Button onClick={handleTitheStop} variant="outline">
                Stop
              </Button>
            )}
            {/* Focus button for active timers not in focus mode */}
            {(state.status === "running" || state.status === "paused") && (
              <Button onClick={handleEnterFocusMode} variant="secondary">
                Focus
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}