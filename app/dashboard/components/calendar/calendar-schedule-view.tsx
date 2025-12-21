import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types";

import { getUserEvents } from "./_actions";
import CalendarGrid from "./calendar-grid";

const PIXELS_PER_HOUR = 60;
const SCROLL_ANIMATION_DURATION = 1000; // milliseconds
const SCROLL_DELAY = 150; // milliseconds - delay to ensure calendar renders

export default function CalendarScheduleView() {
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const userEvents: Event[] = await getUserEvents();
        setEvents(userEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching events:", error);
        const errorMessage = error instanceof Error ? error.message : "Unable to load calendar events. Please try again later.";
        setError(errorMessage);
      }
    }
    fetchEvents()
  }, [])

  // Auto-scroll to current time on component mount and when events load
  useEffect(() => {
    // Small delay to ensure calendar grid has rendered
    const scrollTimer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const currentTime = dayjs();
        const currentHour = currentTime.hour();
        
        // Calculate current time position (accounting for padding: p-4 = 16px)
        const paddingTop = 16;
        
        // Get the scroll container's visible height
        const containerHeight = scrollContainerRef.current.clientHeight;
        
        // Position the view to start just below the hour label of the previous hour
        // Scroll to the current hour's divider position, which puts the previous hour's label above (out of view)
        // The divider should be at the top edge, with the current hour's label visible at the top
        const currentHourDividerPosition = (currentHour * PIXELS_PER_HOUR) + paddingTop;
        const desiredScrollPosition = currentHourDividerPosition;
        
        // Calculate max scroll (total height - container height)
        const totalHeight = (24 * PIXELS_PER_HOUR) + (paddingTop * 2); // 24 hours + top/bottom padding
        const maxScroll = Math.max(0, totalHeight - containerHeight);
        
        // Clamp scroll position between 0 and max scroll
        const scrollPosition = Math.max(0, Math.min(desiredScrollPosition, maxScroll));
        
        // Custom smooth scroll animation with controlled speed
        const startPosition = scrollContainerRef.current.scrollTop;
        const distance = scrollPosition - startPosition;
        let startTime: number | null = null;
        
        function animateScroll(currentTime: number) {
          if (startTime === null) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / SCROLL_ANIMATION_DURATION, 1);
          
          // Easing function for smooth deceleration
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentScroll = startPosition + (distance * easeOutCubic);
          
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentScroll;
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        }
        
        requestAnimationFrame(animateScroll);
      }
    }, SCROLL_DELAY);

    return () => clearTimeout(scrollTimer);
  }, [events]); // Re-run when events are loaded

  if (error) {
    return (
      <Card className="w-full flex flex-col h-[700px] max-w-[600px]">
        <CardHeader className="py-4">
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">⚠️</p>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full flex flex-col h-[700px] max-w-[600px]">
      <CardHeader className="py-4 pb-3">
        <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-0 overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="absolute inset-0 overflow-auto"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="p-4">
              <CalendarGrid events={events} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
