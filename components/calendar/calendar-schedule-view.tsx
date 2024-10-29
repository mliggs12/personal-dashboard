import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserEvents } from "./_actions";
import EventsList from "./events-list";
import dayjs from "dayjs";

export default async function CalendarScheduleView() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const events = await getUserEvents(userId);

  const currentWeek = dayjs();

  return (
    <Card className="w-[450px] h-[500px]">
      <CardContent className="p-4">
        <EventsList events={events} />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          More than 7 days...
        </div>
      </CardContent>
    </Card>
  );
}
