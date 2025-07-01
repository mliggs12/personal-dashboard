"use client";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import DashboardBanner from "./components/dashboard-banner";
import InboxWidget from "./components/inbox/inbox-widget";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import TasksCard from "./components/tasks/tasks-card";
import Timer from "./components/timer/timer";

export default function DashboardPage() {

  return (
    <div className="h-full flex flex-col flex-1 md:max-w-[2160px] mx-auto p-4 pt-0 gap-4">
      <DashboardBanner />
      {/* <div className="grid md:grid-cols-2 h-full gap-4 md:px-4"> */}
      <div className="grid md:grid-cols-2 h-3/4 gap-4">
        <TasksCard />
        <Scratchpad />
        {/* <Timer /> */}
        {/* <CalendarScheduleView /> */}
        {/* <InboxWidget /> */}
      </div>
    </div>
  );
}
