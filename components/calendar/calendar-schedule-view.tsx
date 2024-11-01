import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { getUserEvents } from "./_actions";
import EventsList from "./events-list";

export default async function CalendarScheduleView() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const events = await getUserEvents(userId);

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
