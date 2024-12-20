import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import { weeksAliveSinceBirth } from "./utils.stoic";
import WeekCheckbox from "./week-checkbox";

dayjs.extend(isoWeek);

export default function CalendarGrid({ birthday }: { birthday: string }) {
  return (
    <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] grid-rows-[repeat(88,minmax(0,1fr))] gap-2">
      {Array.from({ length: 88 * 52 }).map((_, index) => (
        <WeekCheckbox
          key={index}
          index={index}
          weeksAlive={weeksAliveSinceBirth(birthday)}
        />
      ))}
    </div>
  );
}
