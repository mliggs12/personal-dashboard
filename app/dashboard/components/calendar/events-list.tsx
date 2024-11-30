import dayjs from "dayjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Event } from "./types";

export function EventCard({ event }: { event: Event }) {
  const { start, title } = event;
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 p-3 pb-0">
        <CardTitle className="w-[110px]">
          {dayjs(start).format("ddd D")}
        </CardTitle>
        <CardDescription className="text-left">{title}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p>{dayjs(start).format("h:mm A")}</p>
      </CardContent>
    </Card>
  );
}

export default function EventsList({ events }: { events: Event[] }) {
  return (
    <ScrollArea>
      <div className="flex flex-col gap-2">
        {events.map((event, index) => (
          <EventCard
            key={index}
            event={event}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
