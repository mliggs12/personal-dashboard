import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);

export async function nextDueDate(frequency: string, startTimestamp: number) {
  const startDate = dayjs(startTimestamp);

  switch (frequency) {
    case "daily":
      return startDate.add(1, "day").format("YYYY/MM/DD");

    case "3-day":
      return startDate.add(3, "day").format("YYYY/MM/DD");

    case "weekly":
      return startDate.add(7, "day").format("YYYY/MM/DD");

    case "monthly":
      return startDate.add(1, "month").format("YYYY/MM/DD");
  }
}
