import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone);
const TIMEZONE = "America/Denver";

export async function nextDueDate(frequency: string, startDue?: string) {
  let startDate = dayjs().startOf("day");
  if (startDue !== null) {
    startDate = dayjs(startDue);
  }

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
