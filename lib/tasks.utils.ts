import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);

export async function nextDueDate(frequency: string, startDue?: string) {
  // Attempt to determine local timezone
  dayjs.tz.setDefault(dayjs.tz.guess());

  const startDate = startDue ? dayjs(startDue, "YYYY/MM/DD") : dayjs.tz();

  switch (frequency) {
    case "daily":
      return startDate.add(1, "day").startOf("day").format("YYYY/MM/DD");

    case "3-day":
      return startDate.add(3, "day").startOf("day").format("YYYY/MM/DD");

    case "weekly":
      return startDate.add(7, "day").startOf("day").format("YYYY/MM/DD");

    case "monthly":
      return startDate.add(1, "month").startOf("day").format("YYYY/MM/DD");
  }
}
