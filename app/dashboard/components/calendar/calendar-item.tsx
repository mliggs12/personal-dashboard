import dayjs from "dayjs";

import { cn } from "@/lib/utils";

import { formatSecondsVerbose } from "../timer/components/timer/time";

interface CalendarItemProps {
  duration: number;
  start: number;
  description: string;
  type?: "session" | "event";
  top: number;
  height: number;
  column?: number;
  totalColumns?: number;
}

/**
 * Calendar item component that displays events or focus sessions on the calendar grid.
 * Supports side-by-side layout for overlapping events.
 */
export default function CalendarItem({
  duration,
  start,
  description,
  type = "session",
  top,
  height,
  column = 0,
  totalColumns = 1,
}: CalendarItemProps) {
  const startTime = dayjs(start);
  const endTime = startTime.add(duration, 'seconds');
  
  // Calculate width and left position for side-by-side layout
  const widthPercent = 100 / totalColumns;
  const leftPercent = column * widthPercent;
  
  // Minimum height to ensure readability
  const minHeight = Math.max(20, height);

  const getItemStyles = () => {
    const baseClasses = cn(
      "absolute rounded-md border flex items-center px-2 z-10 transition-all",
      "hover:shadow-md hover:z-20",
      "cursor-pointer"
    );
    
    if (type === "event") {
      return cn(
        baseClasses,
        "bg-primary/30 border-0 text-secondary-foreground",
        "hover:bg-primary/40"
      );
    }
    
    return cn(
      baseClasses,
      "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
      "hover:bg-green-500/15 hover:border-green-500/50"
    );
  };

  return (
    <div 
      className={getItemStyles()} 
      style={{ 
        top: `${top + 1}px`, // Small offset to position slightly within hour lines
        height: `${minHeight - 1}px`, // Reduce height slightly to maintain bottom alignment
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        marginLeft: column > 0 ? '2px' : '0',
        marginRight: column < totalColumns - 1 ? '2px' : '0',
      }}
      title={`${description} - ${startTime.format('h:mm A')} to ${endTime.format('h:mm A')} (${formatSecondsVerbose(duration)})`}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1 py-0.5">
        <span className="text-xs font-medium truncate leading-tight">
          {description}
        </span>
      </div>
    </div>
  );
}
