"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="h-full flex justify-center">
        <TasksCard />
        {/* <CalendarScheduleView /> */}
      </div>
    );
  }
}
