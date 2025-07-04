import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";
import { finishTimerLogic } from "@/convex/timers";
import { cn } from "@/lib/utils";

import { useAudio } from "../../hooks/use-audio";

interface PomodoroTimerProps {
  inputDuration: number,
  intentionId?: string,
  className?: string
}

export function PomodoroTimer({ inputDuration, intentionId, className }: PomodoroTimerProps) {
  const [inputSeconds, setInputSeconds] = useState(inputDuration);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    setInputSeconds(inputDuration);
  }, [inputDuration]);

  const timerState = useQuery(api.timers.getTimerState);

  const startTimer = useMutation(api.timers.start);
  const pauseTimer = useMutation(api.timers.pause);
  const resumeTimer = useMutation(api.timers.resume);
  const stopTimer = useMutation(api.timers.stop);

  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  const { duration, startedAt, isActive, isPaused, timeLeft } = timerState ?? {} as any;

  const calculateTimeLeft = useCallback(
    (startTime: number) => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      return Math.max(duration! - elapsed, 0);
    },
    [duration]
  );

  useEffect(() => {
    if (!timerState || !timerState.isActive) {
      setDisplayTime(inputDuration)
      return
    }

    if (timerState.isPaused) {
      setDisplayTime(timeLeft)
      return
    }

    const interval = setInterval(() => {
      const timeLeft = calculateTimeLeft(timerState.startedAt!)
      setDisplayTime(timeLeft);

      if (timeLeft === 0) {
        playAlarmSound();
        finishTimerLogic(api.timers, intentionId)
        setDisplayTime(inputSeconds)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState, playAlarmSound, calculateTimeLeft, inputDuration, inputSeconds, intentionId, timeLeft]);

  useEffect(() => {
    if (timerState && timerState.startedAt) {
      const timeLeft = calculateTimeLeft(startedAt!);
      setDisplayTime(timeLeft);
    }
  }, [calculateTimeLeft, timerState, startedAt]);

  const handleStart = () => {
    setDisplayTime(inputSeconds)
    startTimer({ duration: inputSeconds })
  }

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timerState === undefined) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className={cn(
      "flex flex-col items-center p-4 border rounded-lg space-y-4",
      className,
    )}>
      {/* <Clock seconds={displayTime} /> */}
      <div className="text-7xl font-bold mb-2">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-2 justify-center">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Start
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={() => resumeTimer()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={() => pauseTimer()}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={() => stopTimer({ intentionId })}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {isActive && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {isPaused ? "Paused" : "Running"}
        </div>
      )}
    </div>
  );
}
