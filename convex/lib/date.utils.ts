// Centralized date utilities for Convex server-side code
// All date operations should use these utilities to ensure consistency

import { QueryCtx } from "../_generated/server";
import dayjs from "../lib/dayjs.config";
import { getUserTimezone } from "../users";

/**
 * Normalizes a date string to YYYY-MM-DD format.
 * Handles both legacy YYYY/MM/DD format and current YYYY-MM-DD format.
 * 
 * @param date - Date string in YYYY-MM-DD or YYYY/MM/DD format
 * @returns Normalized date string in YYYY-MM-DD format, or undefined if date is undefined/invalid
 */
export function normalizeDateString(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = dayjs(date, ["YYYY-MM-DD", "YYYY/MM/DD"]);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : date;
}

/**
 * Gets today's date in the user's timezone as YYYY-MM-DD string.
 * 
 * @param ctx - Convex query or mutation context
 * @returns Today's date formatted as YYYY-MM-DD in user's timezone
 */
export async function getTodayInUserTimezone(ctx: QueryCtx): Promise<string> {
  const timezone = await getUserTimezone(ctx);
  return dayjs().tz(timezone).format("YYYY-MM-DD");
}

/**
 * Gets the start and end timestamps for a day in the specified timezone.
 * 
 * @param timestamp - Timestamp (milliseconds) representing a point in time
 * @param timezone - IANA timezone string (e.g., "America/Denver")
 * @returns Object with start and end timestamps for the day
 */
export function getDayBoundariesInTimezone(
  timestamp: number,
  timezone: string
): { start: number; end: number } {
  const dayStart = dayjs(timestamp).tz(timezone).startOf("day");
  const dayEnd = dayjs(timestamp).tz(timezone).endOf("day");
  return {
    start: dayStart.valueOf(),
    end: dayEnd.valueOf(),
  };
}

/**
 * Gets the start and end ISO strings for a day in the specified timezone.
 * 
 * @param timestamp - ISO string or timestamp representing a point in time
 * @param timezone - IANA timezone string (e.g., "America/Denver")
 * @returns Object with start and end ISO strings for the day
 */
export function getDayBoundariesISOInTimezone(
  timestamp: string | number,
  timezone: string
): { start: string; end: string } {
  const dayStart = dayjs(timestamp).tz(timezone).startOf("day");
  const dayEnd = dayjs(timestamp).tz(timezone).endOf("day");
  return {
    start: dayStart.toISOString(),
    end: dayEnd.toISOString(),
  };
}

/**
 * Converts a YYYY-MM-DD date string to a timestamp at the start of that day in the specified timezone.
 * 
 * @param date - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone string (e.g., "America/Denver")
 * @returns Timestamp (milliseconds) for the start of the day
 */
export function convertDateStringToTimestamp(date: string, timezone: string): number {
  return dayjs(date).tz(timezone).startOf("day").valueOf();
}

