import { formatTimeRange } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";

interface Event {
  id: string;
  date: string;
  summary: string;
  time: string;
}

async function getOauthToken(userId: string): Promise<string> {
  try {
    const response = await clerkClient.users.getUserOauthAccessToken(
      userId,
      "oauth_google",
    );
    const token = response.data[0].token as string;
    return token;
  } catch (error) {
    throw new Error("Failed to retrieve user OAuth token");
  }
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  const token = await getOauthToken(userId);
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
    {
      headers: headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();

  const events: Event[] = data.items.map((item) => {
    const event = {
      id: item.id,
      date: item.start.dateTime.split("T")[0],
      summary: item.summary,
      time: formatTimeRange(item.start.dateTime, item.end.dateTime),
    };
    return event;
  });

  return events;
}
