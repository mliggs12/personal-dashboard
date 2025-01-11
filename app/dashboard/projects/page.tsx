"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <ul>
        {projects?.map((project) => <li key={project._id}>{project.name}</li>)}
      </ul>
    </div>
  );
}
