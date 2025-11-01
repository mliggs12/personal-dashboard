"use client";

import { useMemo, useState } from "react";
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

export default function CalendarGrid({ events = [] }: CalendarGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [date, setDate] = useState<Date>(new Date());
  const { isClient, timezone } = useClientDate();

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
    return isClient ? dayjs(date).tz(timezone) : dayjs(date).tz("America/Denver");
  }, [date, isClient, timezone]);

  // Memoize the hour boundaries for performance
  const hourBoundaries = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      start: currentDate.hour(i).minute(0).second(0),
      end: currentDate.hour(i).minute(59).second(59),
    }));
  }, [currentDate]);

  if (!isClient || daySessions === undefined) {
    return <div>Loading...</div>;
  }

  // Generate hours in 12-hour format with AM/PM
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    if (hour === 12) {
      return `${hour} ${i < 12 ? 'AM' : 'PM'}`;
    }
    return `${hour}:00`;
  })

  return (
    <div className="relative rounded-xl flex">
      <div className="flex flex-col">
        {hours.map((hour, i) => (
          <div
            key={`hour-${i}`}
            className={cn("px-1 h-[240px] text-left text-sm")}
          >
            {hour}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col relative">
        <NowLine />
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={`hour-${i}`}
            className="relative w-full border-b h-[240px] px-4"
          >
            {/* Google Calendar Events */}
            {events
              .filter((event) => {
                const eventStart = dayjs(event.start);
                const eventEnd = dayjs(event.end);
                
                if (!eventStart.isValid() || !eventEnd.isValid()) return false;
                
                // Show event if it overlaps with this hour
                const { start: hourStart, end: hourEnd } = hourBoundaries[i];
                
                return eventStart.isBefore(hourEnd) && eventEnd.isAfter(hourStart);
              })
              .map((event) => {
                const eventStart = dayjs(event.start);
                const eventEnd = dayjs(event.end);
                const duration = eventEnd.diff(eventStart, 'seconds');
                return (
                  <CalendarItem 
                    key={`event-${event.id}`} 
                    duration={duration} 
                    start={eventStart.valueOf()} 
                    description={event.summary}
                    type="event"
                    currentHour={i}
                    calendarDate={currentDate}
                  />
                );
              })}
            
            {/* Focus Sessions */}
            {daySessions
              .filter((session: Doc<"sessions">) => {
                const sessionStart = dayjs(session.start);
                const sessionEnd = dayjs(session.start).add(session.duration, 'seconds');
                
                if (!sessionStart.isValid()) return false;
                
                // Show session if it overlaps with this hour
                const { start: hourStart, end: hourEnd } = hourBoundaries[i];
                
                return sessionStart.isBefore(hourEnd) && sessionEnd.isAfter(hourStart);
              })
              .map((session: Doc<"sessions">) => (
                <CalendarItem 
                  key={session._id} 
                  duration={session.duration} 
                  start={session.start} 
                  description={session.description || 'Focus Session'}
                  type="session"
                  currentHour={i}
                  calendarDate={currentDate}
                />
              ))}
          </div>
        ))}
      </div>
    </div >
  );
}
