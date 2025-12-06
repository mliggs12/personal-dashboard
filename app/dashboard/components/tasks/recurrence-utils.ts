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

