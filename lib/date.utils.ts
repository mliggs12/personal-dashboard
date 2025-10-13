// Global Date/Time Display Formatting

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

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
