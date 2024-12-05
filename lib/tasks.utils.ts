import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(isToday);
dayjs.extend(timezone);
dayjs.extend(utc);

export async function nextDueDate(frequency: string, startDue?: string) {
  const startDate = startDue
    ? dayjs(startDue, "YYYY/MM/DD")
    : dayjs().startOf("day");
  console.log(startDate);

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
