"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { columns } from "./components/columns";

export default function ProjectsPage() {
  const { id } = useParams<{ id: Id<"projects"> }>();
  const project = useQuery(api.projects.get, {
    projectId: id,
  });
  const tasks = useQuery(api.tasks.getByProject, { projectId: id });

  if (project === undefined || tasks === undefined) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="md:text-2xl font-semibold">Project: {project?.name}</h1>
        <p>{project?.notes}</p>
      </div>
      <div className="space-y-2">
        <h2 className="md:text-lg font-semibold">Tasks</h2>
        <div className="container mx-auto">
          <DataTable
            columns={columns}
            data={tasks}
          />
        </div>
      </div>
    </div>
  );
}
