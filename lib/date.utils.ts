// Global Date/Time Display Formatting

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export function formatShortDate(date: Date) {
  return dayjs(date).format("ll");
}

export function timestampToShortDate(timestamp: number) {
  return dayjs(timestamp).format("MM/DD");
}

export function timestampToDateTime(timestamp: number) {
  return dayjs(timestamp).format("lll");
}

export function timestampToTime(timestamp: number) {
  return dayjs(timestamp).format("LT");
}

export function calculateDuration(end: number, start: number) {
  const timeEnd = dayjs(end);
  const timeStart = dayjs(start);

  return timeEnd.diff(timeStart, "hour", true).toFixed(2);
}
