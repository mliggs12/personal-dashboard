"use server"

import { auth, clerkClient } from "@clerk/nextjs/server";
import dayjs from "dayjs";

import { Event } from "@/types";

// Google Calendar API response type
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface GoogleCalendarResponse {
  items?: GoogleCalendarEvent[];
}

async function getOauthToken(userId: string): Promise<string> {
  const client = await clerkClient();
  const clerkResponse = await client.users.getUserOauthAccessToken(
    userId,
    "oauth_google",
  );
  
  if (!clerkResponse.data || clerkResponse.data.length === 0) {
    throw new Error("No OAuth token found for Google Calendar");
  }
  
  const token = clerkResponse.data[0].token;
  if (!token) {
    throw new Error("OAuth token is empty");
  }
  
  return token;
}

// Shared utility to map Google Calendar events to our Event type
function mapCalendarEvents(items: GoogleCalendarEvent[] | undefined): Event[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.map((item) => ({
    id: item.id,
    summary: item.summary,
    start: item.start.dateTime || item.start.date || '',
    end: item.end.dateTime || item.end.date || '',
  }));
}

export async function getUserEvents(): Promise<Event[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await getOauthToken(userId);

    const oneWeekFromToday = dayjs().add(7, "day").endOf("day").toISOString();
    const timeMin = dayjs().startOf("hour").toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${timeMin}&timeMax=${oneWeekFromToday}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Calendar API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch user events: ${response.status} ${response.statusText}`);
    }
    
    const data: GoogleCalendarResponse = await response.json();
    
    return mapCalendarEvents(data.items);
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
}

export async function getHolidayEvents(): Promise<Event[]> {
  try {
    const oneWeekFromToday = dayjs().add(7, "day").endOf("day").toISOString();
    const timeMin = dayjs().startOf("day").toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/en.usa%23holiday%40group.v.calendar.google.com/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${timeMin}&timeMax=${oneWeekFromToday}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Calendar API error (holidays): ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch holiday events: ${response.status} ${response.statusText}`);
    }

    const data: GoogleCalendarResponse = await response.json();

    return mapCalendarEvents(data.items);
  } catch (error) {
    console.error('Error fetching holiday events:', error);
    throw error;
  }
}
