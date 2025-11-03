// Global Date/Time Display Formatting and Timezone Utilities

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

export function formatShortDate(date: Date) {
  return dayjs(date).format("ll"); // "Aug 16, 2018"
}

export function timestampToShortDate(timestamp: number) {
  return dayjs(timestamp).format("MM/DD");  // "08/16"
}

export function timestampToLongDate(timestamp: number) {
  return dayjs(timestamp).format("MM/DD/YYYY"); // "08/16/2018"
}

export function timestampToDateTime(timestamp: number) {
  return dayjs(timestamp).format("lll"); // "Aug 16, 2018 2:00 PM"
}

export function timestampToShortDateTime(timestamp: number) {
  return dayjs(timestamp).format("MMM D LT"); // "Aug 16 2:00 PM"
}

export function timestampToTime(timestamp: number) {
  return dayjs(timestamp).format("LT"); // "2:00 PM"
}

export function timestampToTimeShort(timestamp: number) {
  return dayjs(timestamp).format("h:mm"); // "2:00"
}

export function calculateDuration(end: number, start: number) {
  const timeEnd = dayjs(end);
  const timeStart = dayjs(start);

  return timeEnd.diff(timeStart, "hour", true).toFixed(2);
}

// Timezone Utilities

/**
 * Gets today's date in the specified timezone as YYYY-MM-DD string.
 * 
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Today's date formatted as YYYY-MM-DD
 * 
 * @example
 * const today = getTodayInTimezone("America/New_York"); // "2025-10-31"
 */
export function getTodayInTimezone(timezone: string): string {
  return dayjs().tz(timezone).format("YYYY-MM-DD");
}

/**
 * Detects the user's timezone using the browser's Intl API.
 * 
 * **Client-side only** - This function should only be called in client components
 * after hydration. Use the `useClientDate` hook for React components.
 * 
 * The timezone is determined using `Intl.DateTimeFormat().resolvedOptions().timeZone`,
 * which is the recommended approach per W3C and MDN best practices.
 * 
 * @returns {string} IANA timezone string (e.g., "America/New_York", "Europe/London")
 *                  Returns "America/Denver" if Intl API is unavailable
 * 
 * @example
 * // In a client component (after hydration):
 * const timezone = getUserTimezone(); // "America/New_York"
 * const today = getTodayInTimezone(timezone); // "2025-10-31"
 */
export const getUserTimezone = (): string => {
  // Client-side only - should not be called during SSR
  if (
    typeof window !== "undefined" &&
    typeof Intl !== "undefined" &&
    typeof Intl.DateTimeFormat === "function"
  ) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone && typeof timezone === "string") {
        return timezone;
      }
    } catch (error) {
      console.warn(
        "[getUserTimezone] Failed to detect timezone, using fallback:",
        error,
      );
    }
  }
  // Fallback timezone if detection fails
  return "America/Denver";
};
