import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormattedDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function convertMinutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes < 10) {
    return `${hours}:0${remainingMinutes}`;
  }

  return `${hours}:${remainingMinutes}`;
}
export function convertToReadableTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);

  // Get hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Format minutes to always be two digits
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();

  // Construct the readable time string
  const readableTime = `${hours}:${minutesStr} ${ampm}`;

  return readableTime;
}

export function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.getTime() === endDate.getTime()) {
    return convertToReadableTime(start);
  }

  const startTime = convertToReadableTime(start);
  const endTime = convertToReadableTime(end);

  // Extract hours and minutes for start and end times
  const [startHours, startMinutes] = startTime.split(" ")[0].split(":");
  const [endHours, endMinutes] = endTime.split(" ")[0].split(":");
  const startAMPM = startTime.split(" ")[1];
  const endAMPM = endTime.split(" ")[1];

  // Construct the time range string
  if (startAMPM === endAMPM) {
    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes} ${endAMPM}`;
  } else {
    return `${startHours}:${startMinutes} ${startAMPM} - ${endHours}:${endMinutes} ${endAMPM}`;
  }
}
