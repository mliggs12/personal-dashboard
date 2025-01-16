"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/types";

import { getUserEvents } from "./_actions";
import EventsList from "./events-list";

export default function CalendarScheduleView() {
  // const events: Event[] = await getUserEvents(userId);
  const events: Event[] = [];

  return (
    <Card className="w-[450px] h-full">
      <CardContent className="p-4">
        <EventsList events={events} />
        <div className="my-4 text-center text-sm text-muted-foreground">
          More than 7 days...
        </div>
      </CardContent>
    </Card>
  );
}
