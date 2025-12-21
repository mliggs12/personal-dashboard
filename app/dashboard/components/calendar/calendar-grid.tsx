"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import dayjs from "dayjs";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useClientDate } from "@/hooks/useClientDate";
import { cn } from "@/lib/utils";
import { Event } from "@/types";

import CalendarItem from "./calendar-item";
import NowLine from "./nowLine";

interface CalendarGridProps {
  events?: Event[];
}

// Constants for calendar layout
const PIXELS_PER_HOUR = 60; // 60px per hour = 1px per minute
const PIXELS_PER_MINUTE = 1;

/**
 * Calculates the layout for overlapping events by grouping them and assigning column positions.
 * Events that overlap are displayed side-by-side with proportional widths.
 */
function calculateEventLayout<T extends { start: number; end: number }>(
  items: T[]
): Array<T & { column: number; totalColumns: number }> {
  if (items.length === 0) return [];

  // Sort by start time
  const sorted = [...items].sort((a, b) => a.start - b.start);
  
  // Group overlapping events
  const groups: T[][] = [];
  let currentGroup: T[] = [];
  let currentEnd = 0;

  sorted.forEach((item) => {
    if (item.start >= currentEnd) {
      // Start a new group
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [item];
      currentEnd = item.end;
    } else {
      // Add to current group
      currentGroup.push(item);
      currentEnd = Math.max(currentEnd, item.end);
    }
  });
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Calculate columns for each group
  const result: Array<T & { column: number; totalColumns: number }> = [];
  
  groups.forEach((group) => {
    const totalColumns = group.length;
    group.forEach((item, index) => {
      result.push({
        ...item,
        column: index,
        totalColumns,
      });
    });
  });

  return result;
}

export default function CalendarGrid({ events = [] }: CalendarGridProps) {
  const { isClient, timezone } = useClientDate();
  const date = useMemo(() => new Date(), []); // Current date for day filtering

  const daySessions = useQuery(
    api.sessions.getDaySessions,
    isClient
      ? {
          timestamp: dayjs(date).toISOString(),
          userTimezone: timezone,
        }
      : "skip"
  );

  // Get the current date in user's timezone for proper hour calculations
  const currentDate = useMemo(() => {
    return isClient ? dayjs(date).tz(timezone).startOf('day') : dayjs(date).tz("America/Denver").startOf('day');
  }, [date, isClient, timezone]);

  // Filter events to current day and convert to absolute positions
  const processedEvents = useMemo(() => {
    const dayStart = currentDate.startOf('day');
    const dayEnd = currentDate.endOf('day');

    return events
      .map((event) => {
        // Skip all-day events (they have date instead of dateTime)
        if (!event.start.includes('T')) {
          return null;
        }

        // Parse the ISO string - Google Calendar returns dates in ISO format with timezone
        // Parse as-is first (dayjs will parse the timezone from the ISO string)
        let eventStart = dayjs(event.start);
        let eventEnd = dayjs(event.end);

        if (!eventStart.isValid() || !eventEnd.isValid()) {
          return null;
        }

        // Convert to user's timezone if not already in it
        // If the ISO string doesn't have timezone info, assume UTC
        if (!event.start.includes('Z') && !event.start.match(/[+-]\d{2}:\d{2}$/)) {
          eventStart = eventStart.utc();
          eventEnd = eventEnd.utc();
        }
        
        const eventStartTz = eventStart.tz(timezone);
        const eventEndTz = eventEnd.tz(timezone);

        // Filter to current day (check if event overlaps with today)
        if (eventStartTz.isAfter(dayEnd) || eventEndTz.isBefore(dayStart)) {
          return null;
        }

        // Calculate absolute position from start of day
        const startMinutes = eventStartTz.diff(dayStart, 'minute');
        const endMinutes = eventEndTz.diff(dayStart, 'minute');
        const durationMinutes = endMinutes - startMinutes;

        return {
          id: event.id,
          summary: event.summary,
          start: startMinutes,
          end: endMinutes,
          duration: durationMinutes,
          startTimestamp: eventStartTz.valueOf(),
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [events, currentDate, timezone]);

  // Process sessions similarly
  const processedSessions = useMemo(() => {
    if (!daySessions) return [];

    const dayStart = currentDate.startOf('day');

    return daySessions
      .map((session: Doc<"sessions">) => {
        const sessionStart = dayjs(session.start).tz(timezone);
        const sessionEnd = sessionStart.add(session.duration, 'seconds');

        const startMinutes = sessionStart.diff(dayStart, 'minute');
        const endMinutes = sessionEnd.diff(dayStart, 'minute');
        const durationMinutes = endMinutes - startMinutes;

        return {
          id: session._id,
          description: session.description || 'Focus Session',
          start: startMinutes,
          end: endMinutes,
          duration: durationMinutes,
          startTimestamp: session.start,
          sessionDuration: session.duration,
        };
      })
      .filter((s) => s.start >= 0 && s.start < 24 * 60);
  }, [daySessions, currentDate, timezone]);

  // Calculate layout for events and sessions separately
  const eventLayout = useMemo(() => {
    return calculateEventLayout(processedEvents);
  }, [processedEvents]);

  const sessionLayout = useMemo(() => {
    return calculateEventLayout(processedSessions);
  }, [processedSessions]);

  if (!isClient || daySessions === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Generate hours in 12-hour format with AM/PM
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour} ${period}`;
  });

  return (
    <div className="relative flex w-full">
      {/* Hour Labels Column */}
      <div className="flex flex-col w-16 shrink-0 border-r border-border">
        {hours.map((hour, i) => (
          <div
            key={`hour-${i}`}
            className={cn(
              "h-[60px] flex items-start justify-end pr-3 pt-1 text-xs font-medium text-muted-foreground",
              i > 0 && "border-t border-border"
            )}
          >
            {hour}
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 relative min-h-[1440px] px-2" style={{ height: `${24 * PIXELS_PER_HOUR}px` }}>
        <NowLine />
        
        {/* Hour dividers */}
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={`divider-${i}`}
            className="absolute left-0 right-0 border-t border-border"
            style={{ top: `${i * PIXELS_PER_HOUR}px` }}
          />
        ))}

        {/* Google Calendar Events */}
        {eventLayout.map((event) => (
          <CalendarItem
            key={`event-${event.id}`}
            duration={event.duration * 60} // Convert minutes to seconds
            start={event.startTimestamp}
            description={event.summary}
            type="event"
            top={event.start * PIXELS_PER_MINUTE}
            height={event.duration * PIXELS_PER_MINUTE}
            column={event.column}
            totalColumns={event.totalColumns}
          />
        ))}

        {/* Focus Sessions */}
        {sessionLayout.map((session) => (
          <CalendarItem
            key={`session-${session.id}`}
            duration={session.sessionDuration}
            start={session.startTimestamp}
            description={session.description}
            type="session"
            top={session.start * PIXELS_PER_MINUTE}
            height={session.duration * PIXELS_PER_MINUTE}
            column={session.column}
            totalColumns={session.totalColumns}
          />
        ))}
      </div>
    </div>
  );
}
