import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col flex-1">
      <TasksCard />
      {/* <CalendarScheduleView /> */}
    </div>
  );
}
