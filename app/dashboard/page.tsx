"use client";

import { redirect } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import CalendarScheduleView from "./components/calendar/calendar-schedule-view";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    redirect("/");
  };

  return (
    <div className="h-full flex flex-col md:flex-row flex-1 p-4 gap-4">
      <TasksCard />
      {/* <CalendarScheduleView /> */}
    </div>
  );
}
