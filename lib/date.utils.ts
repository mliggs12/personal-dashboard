// Global Date/Time Display Formatting

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export function formatShortDate(date: Date) {
  return dayjs(date).format("ll");
}
