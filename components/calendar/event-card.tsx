import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface Event {
  id: string;
  summary: string;
  time: string;
}

export default function EventCard(event: Event) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle>{event.summary}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p>{event.time}</p>
      </CardContent>
    </Card>
  );
}
