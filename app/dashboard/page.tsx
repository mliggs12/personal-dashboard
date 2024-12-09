import TasksCard from "./components/tasks/tasks-card";

export default function DashboardPage() {
  return (
    <div className="h-full flex justify-center">
      <TasksCard />
      {/* <CalendarScheduleView /> */}
    </div>
  );
}
