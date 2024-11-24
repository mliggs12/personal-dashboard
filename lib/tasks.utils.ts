import dayjs from "dayjs";

export function NextDueDate(frequency: string) {
  const today = dayjs().startOf("day");

  switch (frequency) {
    case "daily":
      return today.add(1, "day").format("YYYY/MM/DD");

    case "3-day":
      return today.add(3, "day").format("YYYY/MM/DD");

    case "weekly":
      return today.add(7, "day").format("YYYY/MM/DD");
  }
}
