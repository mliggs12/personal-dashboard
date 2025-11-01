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
 * This function is safe to use in both server and client environments:
 * - On the client: Returns the user's actual timezone (e.g., "America/New_York")
 * - On the server: Returns a default fallback timezone ("America/Denver")
 * 
 * The timezone is determined using `Intl.DateTimeFormat().resolvedOptions().timeZone`,
 * which is the recommended approach per W3C and MDN best practices.
 * 
 * @returns {string} IANA timezone string (e.g., "America/New_York", "Europe/London")
 * 
 * @example
 * // In a client component:
 * const timezone = getUserTimezone(); // "America/New_York"
 * const today = dayjs().tz(timezone).format("YYYY-MM-DD");
 */
export const getUserTimezone = (): string => {
  // Use browser's Intl API for more reliable timezone detection
  // This is the recommended method per MDN and W3C standards
  // Only available on client side
  if (
    typeof window !== "undefined" &&
    typeof Intl !== "undefined" &&
    typeof Intl.DateTimeFormat === "function"
  ) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Validate that we got a valid timezone string
      if (timezone && typeof timezone === "string") {
        console.log(
          "[getUserTimezone] Client timezone detected:",
          timezone,
          "- Environment: CLIENT",
        );
        return timezone;
      }
    } catch (error) {
      // Fallback if resolvedOptions() throws (rare edge case)
      // This can happen with malformed browser implementations
      console.warn(
        "[getUserTimezone] Failed to detect timezone using Intl API, using fallback:",
        error,
      );
    }
  }
  // Server-side fallback - use a default timezone
  // This will be replaced when the component hydrates on the client
  const fallbackTimezone = "America/Denver";
  console.log(
    "[getUserTimezone] Using server fallback timezone:",
    fallbackTimezone,
    "- Environment:",
    typeof window === "undefined" ? "SERVER (SSR)" : "CLIENT (Intl unavailable)",
  );
  return fallbackTimezone; // Default timezone for SSR
};
