import dayjs from "dayjs";

import { Event } from "@/types";

async function getOauthToken(userId: string): Promise<string> {
  try {
    const token = await fetch("/api/auth/google-token", {
      headers: {
        "user-id": userId,
      },
    })
      .then((res) => res.json())
      .then((data) => data.token);

    if (!token) {
      throw new Error("No token found");
    }

    return token;
  } catch (error) {
    throw new Error("Failed to retrieve user OAuth token");
  }
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  const token = await getOauthToken(userId);
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  const oneWeekFromToday = dayjs().add(7, "day").endOf("day").toISOString();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${dayjs().startOf("hour").toISOString()}&timeMax=${oneWeekFromToday}`,
    {
      headers: headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();

  const events: Event[] = data.items.map((item: Event) => {
    const event = {
      id: item.id,
      title: item.title,
      description: item.description,
      start: item.start,
      end: item.end,
      created: item.created,
      recurringEventId: item.recurringEventId,
    };
    return event;
  });

  return events;
}
