// Shared constants and utilities for recurrence functionality

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAYS_OF_WEEK_OBJECTS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function formatDaysOfWeek(days: number[]): string {
  return days
    .sort()
    .map((d) => DAYS_OF_WEEK[d])
    .join(", ");
}

export function getCurrentDayOfWeek(): number {
  return new Date().getDay();
}

export function getCurrentDayName(): string {
  return DAYS_OF_WEEK[getCurrentDayOfWeek()];
}

export function getDayOfWeekFromDate(date: Date): number {
  return date.getDay();
}

export function getDayNameFromDate(date: Date): string {
  return DAYS_OF_WEEK[getDayOfWeekFromDate(date)];
}

export function getDayOfMonthFromDate(date: Date): number {
  return date.getDate();
}

export function getMonthNameFromDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
}

export function formatDayOfMonth(day: number): string {
  const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
  return `The ${day}${suffix} day`;
}

/**
 * Calculates the next occurrence date for a weekly schedule with specific days of week.
 * Returns the next date that matches one of the selected days, starting from the base date.
 */
export function calculateNextWeeklyOccurrence(
  daysOfWeek: number[],
  baseDate: Date = new Date()
): Date {
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const currentDayOfWeek = baseDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Find the next day in the current week (must be >= currentDayOfWeek)
  const nextDayInWeek = sortedDays.find(day => day >= currentDayOfWeek);
  
  if (nextDayInWeek !== undefined) {
    // Next day is in the current week (or today)
    const daysToAdd = nextDayInWeek - currentDayOfWeek;
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + daysToAdd);
    return nextDate;
  } else {
    // No day found in current week, wrap to first day of next week
    const firstDay = sortedDays[0];
    const daysToEndOfWeek = 7 - currentDayOfWeek;
    const daysToAdd = daysToEndOfWeek + firstDay;
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + daysToAdd);
    return nextDate;
  }
}

