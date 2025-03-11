"use client";

import { redirect } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import DashboardBanner from "./components/dashboard-banner";
import Scratchpad from "./components/scratch-pad/scratch-pad";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    redirect("/");
  };

  return (
    <div className="h-full flex flex-col flex-1 px-4 md:p-4 gap-4">
      <DashboardBanner />
      {/* <div className="grid md:grid-cols-2 h-full gap-4 md:px-4"> */}
      <TasksCard />
      {/* <CalendarScheduleView /> */}
      <Scratchpad />
    </div>
  );
}
