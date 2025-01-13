"use client";

import { useQuery } from "convex/react";
import { Link } from "lucide-react";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ProjectsPage() {
  const { id } = useParams<{ id: Id<"projects"> }>();
  const project = useQuery(api.projects.get, {
    projectId: id,
  });
  const tasks = useQuery(api.tasks.getByProject, { projectId: id });

  if (project === undefined || tasks === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="md:text-2xl font-semibold">Project: {project?.name}</h1>
        <p>{project?.notes}</p>
      </div>
      <div>
        <h2 className="md:text-xl font-semibold">Tasks</h2>
        <ul>
          {tasks?.map((task) => (
            <li key={task._id}>
              <Link
                href={`/dashboard/tasks/${task._id}`}
                className="cursor-pointer hover:text-primary"
              >
                {task.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
