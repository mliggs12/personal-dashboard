import { clerkClient } from "@clerk/nextjs/server";
import { Event } from "./types";

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

  const events: Event[] = data.items.map((item: any) => {
    const event = {
      _id: item.id,
      created: new Date(item.created),
      description: item.description,
      end: new Date(item.end.dateTime),
      start: new Date(item.start.dateTime),
      title: item.summary,
      recurringEventId: item.recurringEventId,
    };
    return event;
  });

  return events;
}
