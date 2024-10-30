import RecentNotesWidget from "./recent-notes-widget";
import TasksCard from "./tasks/tasks-card";

export default function DashboardClient() {
  return (
    <div className="flex flex-col gap-2">
      <RecentNotesWidget />
      <TasksCard />
    </div>
  );
}
