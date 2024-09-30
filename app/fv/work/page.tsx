import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import PreselectedTasksList from "./preselected-tasks-list";

export default function WorkPage() {
  // const preselectedTasks = useQuery(api.tasks.preselectedTasks) ?? [];

  return (
    <main className="flex flex-col items-center h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Start the timer when you are ready to start working on the first task.
        </h1>
        <p className="text-2xl mb-2">
          You don&apos;t have to finish the task - only do some work on it.
        </p>
        <div>
          <PreselectedTasksList />
        </div>
      </div>
    </main>
  );
}
