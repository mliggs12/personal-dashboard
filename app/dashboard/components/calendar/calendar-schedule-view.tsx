import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types";

import { getUserEvents } from "./_actions";
import CalendarGrid from "./calendar-grid";


export default function CalendarScheduleView() {
  const [events, setEvents] = useState<Event[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const userEvents: Event[] = await getUserEvents();
        console.log(userEvents)
        setEvents(userEvents);
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    fetchEvents()
  }, [])

  // Auto-scroll to current time on component mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentTime = dayjs();
      const currentHour = currentTime.hour();
      const currentMinute = currentTime.minute();
      
      // Each hour is 240px, so each minute is 4px
      const currentTimePosition = (currentHour * 240) + (currentMinute * 4);
      
      // Scroll to show current time near the top (with some offset to show the now line clearly)
      const scrollPosition = Math.max(0, currentTimePosition - 120); // 120px offset to show now line near top
      
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [events]); // Re-run when events are loaded

  return (
    <Card className="hidden sm:flex flex-col h-[900px] w-full max-w-[600px]">
      <CardHeader className="py-4">
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-4 py-0">
        <div className="flex-1 relative">
          <div 
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-auto hide-scrollbar"
          >
            <CalendarGrid events={events} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
