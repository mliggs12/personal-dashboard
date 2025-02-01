import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types";

import { getHolidayEvents, getUserEvents } from "./_actions";
import EventsList from "./events-list";

export default async function CalendarScheduleView() {
  const events: Event[] = await getUserEvents();
  const holidays: Event[] = await getHolidayEvents();

  return (
    <Card className="flex flex-col md:w-[650px] md:h-1/2 w-full overflow-hidden">
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
