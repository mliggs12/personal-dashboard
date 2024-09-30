import EventCard from "./event-card";

interface Event {
  id: string;
  date: string;
  summary: string;
  time: string;
}

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <EventCard
          key={event.id}
          {...event}
        />
      ))}
    </div>
  );
}
