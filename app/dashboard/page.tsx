"use client";

import { redirect } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import DashboardBanner from "./components/dashboard-banner";
import InboxWidget from "./components/inbox/inbox-widget";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {

  return (
    <div className="h-full flex flex-col flex-1 md:max-w-[2160px] mx-auto px-4 gap-4">
      <DashboardBanner />
      {/* <div className="grid md:grid-cols-2 h-full gap-4 md:px-4"> */}
      <div className="grid md:grid-cols-2 h-3/4 gap-4 mb-4 md:mb-0">
        <TasksCard />
        <div className="space-y-4">
          <Scratchpad />
          {/* <CalendarScheduleView /> */}
        </div>
        {/* <InboxWidget /> */}
      </div>
    </div>
  );
}
