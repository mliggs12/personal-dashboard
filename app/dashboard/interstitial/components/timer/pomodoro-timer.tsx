import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

import Clock from "./clock";
import { formatTime } from "./time";
import { useAudio } from "../../hooks/use-audio";

export function PomodoroTimer() {
  const defaultTime = 60;
  const currentTimer = useQuery(api.timers.getActive);
  const [localRemaining, setLocalRemaining] = useState(0);

  const startTimer = useMutation(api.timers.start);
  const pauseTimer = useMutation(api.timers.pause);
  const completeInterval = useMutation(api.timers.completeInterval);

  const { play: playAlarmSound } = useAudio("/sound/airplane_chime.mp3");

  useEffect(() => {
    if (!currentTimer) return;

    const calculateRemaining = () => {
      const elapsed = Math.floor((Date.now() - currentTimer.start) / 1000);
      return Math.max(currentTimer.duration - elapsed, 0);
    };

    setLocalRemaining(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setLocalRemaining(remaining);
      if (remaining <= 0 && currentTimer.isActive) {
        playAlarmSound();
        completeInterval({ timerId: currentTimer._id });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTimer, completeInterval, playAlarmSound, defaultTime, localRemaining]);

  if (!currentTimer || currentTimer === undefined) {
    return (
      <div className="flex flex-col items-center p-4 border rounded-lg space-y-4">
        <Clock seconds={defaultTime} />
        <Button onClick={() => startTimer({ duration: defaultTime })}>Start</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg space-y-4">
      <Clock seconds={localRemaining > 0 ? localRemaining : defaultTime} />
      <div className="flex gap-2">
        {currentTimer.isActive ? (
          <Button onClick={() => pauseTimer({ timerId: currentTimer._id })}>
            Pause
          </Button>
        ) : (
          <Button onClick={() => startTimer({ duration: defaultTime })}>
            {localRemaining > 0 ? 'Resume' : 'Start'}
          </Button>
        )}
      </div>
    </div>
  );
}
