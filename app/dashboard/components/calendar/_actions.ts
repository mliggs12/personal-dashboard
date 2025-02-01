import { auth, clerkClient } from "@clerk/nextjs/server";
import dayjs from "dayjs";

import { Event } from "@/types";

async function getOauthToken(userId: string) {
  const client = await clerkClient();
  const clerkResponse = await client.users.getUserOauthAccessToken(
    userId,
    "oauth_google",
  );
  
  return clerkResponse.data[0].token || "";
}

export async function getUserEvents() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

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
    throw new Error(response.statusText);
  }

  const data = await response.json();

  const events = data.items.map((item: any) => {
    const event: Event = {
      id: item.id,
      summary: item.summary,
      start: item.start.dateTime,
      end: item.end.date,
    };
    return event;
  });
  return events;
}

export async function getHolidayEvents() {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/en.usa%23holiday%40group.v.calendar.google.com/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=2021-01-01T00%3A00%3A00Z",
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  const events = data.items.map((item) => {
    const event: Event = {
      id: item.id,
      summary: item.summary,
      start: item.start.dateTime,
      end: item.end.date,
    };
    return event;
  });
  return events;
}
