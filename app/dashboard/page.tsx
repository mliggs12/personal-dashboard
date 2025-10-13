"use client";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import DashboardBanner from "./components/dashboard-banner";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import TasksCard from "./components/tasks/tasks-card";
import Timer from "./components/timer/timer";

export default function DashboardPage() {

  return (
    <div className="h-full flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full">
      <DashboardBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1 md:p-4 w-full">
        <div className="flex justify-center">
          <TasksCard />
        </div>
        <div className="flex justify-center">
          <Scratchpad />
        </div>
        <div className="flex justify-center">
          <Timer />
        </div>
        <div className="flex justify-center">
          <CalendarScheduleView />
        </div>
      </div>
    </div>
  );
}
