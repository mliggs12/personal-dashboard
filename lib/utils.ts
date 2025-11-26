import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import dayjs from "./dayjs.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDurationVerbose(duration: number) {
  const d = dayjs.duration(duration, "seconds");
  if (d.hours() === 0 && d.minutes() === 0) {
    return `${d.seconds()} seconds`;
  } else if (d.hours() === 0) {
    return `${d.minutes()} minutes, ${d.seconds()} seconds`;
  }
  return `${d.hours()} hours, ${d.minutes()} minutes, ${d.seconds()} seconds`;
}

export function convertMinutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes < 10) {
    return `${hours}:0${remainingMinutes}`;
  }

  return `${hours}:${remainingMinutes}`;
}

export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Plan
// Take the start time (minutes after midnight) and convert it to a readable time
export function formatMinToReadable(minutes: number): string {
  // Convert minutes after midnight to hours and minutes
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

// Convert a time string input and convert it to minutes after midnight
// e.g. "130" -> 90
export function convertTimeInputToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

// Convert minutes to milliseconds
export function convertMinutesToMilliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

export function getLocalDateString(timestamp: number) {
  // Convert the UTC timestamp to a date object in format YYYY-MM-DD
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const localDateString = `${year}-${month}-${day}`;

  return localDateString;
}
