"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function NowLine() {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate position based on current time
  const currentHour = currentTime.hour();
  const currentMinute = currentTime.minute();
  
  // Each hour is 240px, so each minute is 4px
  const topPosition = (currentHour * 240) + (currentMinute * 4);

  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
        <span className="text-xs text-red-500 ml-2 bg-white px-1 rounded">
          {currentTime.format('h:mm A')}
        </span>
      </div>
    </div>
  );
}
