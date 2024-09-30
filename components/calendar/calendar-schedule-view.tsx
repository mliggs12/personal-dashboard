import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import EventsList from "./events-list";
import { getUserEvents } from "./_actions";

export default async function CalendarScheduleView() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }
  const events = await getUserEvents(userId);

  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  return (
    <Card className="min-w-[500px] max-h-[1100px] overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-5xl">{currentMonth}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <EventsList events={events} />
      </CardContent>
    </Card>
  );
}
