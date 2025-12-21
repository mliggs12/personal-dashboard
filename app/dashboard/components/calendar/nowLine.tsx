"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

const PIXELS_PER_HOUR = 60; // 60px per hour = 1px per minute
const PIXELS_PER_MINUTE = 1;
const UPDATE_INTERVAL = 60000; // Update every minute

/**
 * Displays a visual indicator line showing the current time on the calendar grid.
 * Updates every minute to reflect the current time position.
 */
export default function NowLine() {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Calculate position based on current time
  const currentHour = currentTime.hour();
  const currentMinute = currentTime.minute();
  
  // Calculate absolute position: (hours * 60) + minutes
  const topPosition = (currentHour * PIXELS_PER_HOUR) + (currentMinute * PIXELS_PER_MINUTE);

  return (
    <div 
      className="absolute -left-2 -right-2 z-30 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 bg-foreground/60 rounded-full mr-2 shadow-sm ring-2 ring-background"></div>
        <div className="flex-1 h-0.5 bg-border"></div>
      </div>
    </div>
  );
}
