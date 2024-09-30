import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

export default async function PreselectedTasksList() {
  const preselectedTasks = await fetchQuery(api.tasks.preselectedTasks);
  return preselectedTasks.map((task: Doc<"tasks">) => (
    <div key={task._id}>
      <p>{task.name}</p>
    </div>
  ));
}
