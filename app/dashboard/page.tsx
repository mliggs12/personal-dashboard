"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <>
        <TasksCard />
        {/* <CalendarScheduleView /> */}
      </>
    );
  }
}
