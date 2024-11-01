import dayjs from "dayjs";

import CalendarScheduleView from "@/components/calendar/calendar-schedule-view";

import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const now = dayjs();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between space-y-2 px-2">
        <h2 className="text-5xl font-bold tracking-tight">Dashboard</h2>
        <div className="hidden md:flex items-center justify-center">
          <p className="text-lg">{now.format("MMMM D, YYYY [at] h:mm A")}</p>
        </div>
      </div>
      <div className="border-y-2 py-2 px-4 my-2">
        <h3 className="text-xl font-semibold">Intention for my life</h3>
        <p className="font-light italic">
          Alignment with True self
          <br />
          To live with a consistent, unconditional feeling of a fullness of
          being with an inner satisfaction and a passion for life and for
          living.
        </p>
      </div>
      <div className="flex gap-2">
        <TasksCard />
        <CalendarScheduleView />
      </div>
    </div>
  );
}
