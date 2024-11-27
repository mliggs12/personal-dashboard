import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone);
const TIMEZONE = "America/Denver";

export function NextDueDate(frequency: string) {
  const today = dayjs().tz(TIMEZONE).startOf("day");

  switch (frequency) {
    case "daily":
      return today.add(1, "day").startOf("day").format("YYYY/MM/DD");

    case "3-day":
      return today.add(3, "day").startOf("day").format("YYYY/MM/DD");

    case "weekly":
      return today.add(7, "day").startOf("day").format("YYYY/MM/DD");
  }
}
