import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatTimeRange } from "@/lib/utils";
import EventsList from "./events-list";

interface Item {
  id: string;
  summary: string;
  start: string;
  end: string;
}

interface Event {
  id: string;
  summary: string;
  time: string;
}

async function getUserEvents(): Promise<Event[]> {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const response = await clerkClient.users.getUserOauthAccessToken(
    user.id,
    "oauth_google",
  );

  const OauthAccessToken = response.data[0].token;

  const currentTimestamp = new Date().toISOString();

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${OauthAccessToken}`);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${currentTimestamp}`,
    {
      headers: headers,
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();

  const events: Event[] = data.items.map((item) => {
    const event = {
      id: item.id,
      summary: item.summary,
      time: formatTimeRange(item.start.dateTime, item.end.dateTime),
    };
    return event;
  });

  return events;
}

export default async function CalendarScheduleView() {
  const events = await getUserEvents();

  return (
    <Card className="min-w-[500px] max-h-[1100px] overflow-hidden">
      <CardContent className="p-6">
        <EventsList events={events} />
      </CardContent>
    </Card>
  );
}
