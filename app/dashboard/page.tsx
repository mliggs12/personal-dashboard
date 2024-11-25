import dayjs from "dayjs";

import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const now = dayjs();

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between space-y-2 px-2">
        <h2 className="text-5xl font-bold tracking-tight">Dashboard</h2>
        <div className="hidden md:flex items-center justify-center">
          <p className="text-lg">{now.format("MMMM D, YYYY [at] h:mm A")}</p>
        </div>
      </div>
      <div className="border-y-2 py-2 px-4">
        <h3 className="text-xl font-semibold">Inspiring header</h3>
        <p className="font-light italic">Some inspiring quote.</p>
      </div>
      <div className="flex flex-col items-center md:items-start p-2">
        <TasksCard />
        {/* <CalendarScheduleView /> */}
      </div>
    </div>
  );
}
