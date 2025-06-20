import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types";

import { getHolidayEvents, getUserEvents } from "./_actions";
import EventsList from "./events-list";

export default function CalendarScheduleView() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const userEvents: Event[] = await getUserEvents();
        console.log(userEvents)
        // const holidays: Event[] = await getHolidayEvents();
        // const allEvents = [...userEvents, ...holidays];
        setEvents(userEvents);
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }
    fetchEvents()
  }, [])

  return (
    <Card className="flex flex-col h-[900px] w-full max-w-[600px]">
      <CardHeader className="py-4">
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-4 py-0">
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto">
            <EventsList events={events} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
