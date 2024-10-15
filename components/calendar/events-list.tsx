import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "./types";

export function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle>{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p>
          {moment(event.start).format("MMM D hh:mm A")}
          {moment(event.start).format("hh:mm A") !==
            moment(event.end).format("hh:mm A") && (
            <> - {moment(event.end).format("hh:mm A")}</>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default function EventsList({ events }: { events: Event[] }) {
  return (
    <div className="flex flex-col gap-2">
      {events.map((event, index) => (
        <EventCard
          key={index}
          event={event}
        />
      ))}
    </div>
  );
}
