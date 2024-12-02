import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone);
const TIMEZONE = "America/Denver";

export async function nextDueDate(frequency: string) {
  const today = dayjs().startOf("day");
  console.log(today);

  switch (frequency) {
    case "daily":
      return today.add(1, "day").startOf("day").format("YYYY/MM/DD");

    case "weekly":
      return today.add(7, "day").startOf("day").format("YYYY/MM/DD");

    case "monthly":
      return today.add(1, "month").startOf("day").format("YYYY/MM/DD");
  }
}
