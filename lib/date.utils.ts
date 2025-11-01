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
 * Detects the user's timezone using the browser's Intl API.
 *
 * This function is designed for client-side use (components with "use client").
 * The timezone is determined using `Intl.DateTimeFormat().resolvedOptions().timeZone`,
 * which is the recommended approach per W3C and MDN best practices.
 *
 * @returns {string} IANA timezone string (e.g., "America/New_York", "Europe/London").
 *                  Falls back to "UTC" if Intl API is unavailable or fails.
 *
 * @example
 * ```tsx
 * // In a client component:
 * const timezone = getUserTimezone(); // "America/New_York"
 * const today = dayjs().tz(timezone).format("YYYY-MM-DD");
 * ```
 */
export const getUserTimezone = (): string => {
  // Use browser's Intl API for timezone detection (MDN/W3C recommended)
  if (
    typeof Intl !== "undefined" &&
    typeof Intl.DateTimeFormat === "function"
  ) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone && typeof timezone === "string") {
        return timezone;
      }
    } catch (error) {
      // Fallback if resolvedOptions() throws (rare edge case)
      console.warn(
        "[getUserTimezone] Failed to detect timezone, using UTC fallback:",
        error,
      );
    }
  }
  // Universal fallback - UTC is timezone-agnostic
  return "UTC";
};
