import dayjs from "dayjs";

import { timestampToTimeShort } from "@/lib/date.utils";

import { formatSecondsVerbose } from "../timer/components/timer/time";

export default function CalendarItem({
  duration,
  start,
  description,
  type = "session",
  currentHour,
  calendarDate,
}: {
  duration: number;
  start: number;
  description: string;
  type?: "session" | "event";
  currentHour: number;
  calendarDate: dayjs.Dayjs;
}) {
  const startTime = dayjs(start);
  const endTime = startTime.add(duration, 'seconds');
  
  // Calculate the visible portion within this hour
  const hourStart = calendarDate.hour(currentHour).minute(0).second(0);
  const hourEnd = calendarDate.hour(currentHour).minute(59).second(59);
  
  // Determine the actual start and end times for this hour
  const visibleStart = startTime.isAfter(hourStart) ? startTime : hourStart;
  const visibleEnd = endTime.isBefore(hourEnd) ? endTime : hourEnd;
  
  // Calculate height based on visible duration
  const visibleDuration = visibleEnd.diff(visibleStart, 'seconds');
  const heightPixels = Math.max(4, (visibleDuration / 60) * 4); // Minimum 4px height
  
  // Calculate top position within this hour
  const topPixels = visibleStart.diff(hourStart, 'seconds') / 60 * 4;

  const getItemStyles = () => {
    const baseClasses = "absolute w-[250px] rounded-md border flex items-center justify-between px-2 z-10";
    
    if (type === "event") {
      return `${baseClasses} bg-blue-100 border-blue-300 text-blue-800`;
    }
    
    return `${baseClasses} bg-green-100 border-green-300 text-green-800`;
  };

  // Only show the start time if this is the first hour of the item
  const showStartTime = startTime.hour() === currentHour;
  
  // Show duration for the visible portion
  const displayDuration = visibleDuration;

  return (
    <div 
      className={getItemStyles()} 
      style={{ height: `${heightPixels}px`, top: `${topPixels}px` }}
      title={`${description} (${formatSecondsVerbose(duration)})`}
    >
      {showStartTime && (
        <span className="text-xs font-medium">{timestampToTimeShort(start)}</span>
      )}
      <span className="text-xs truncate mx-2 flex-1">{description}</span>
      <span className="text-xs">{formatSecondsVerbose(displayDuration)}</span>
    </div>
  );
}
