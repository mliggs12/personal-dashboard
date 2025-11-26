"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import AddProjectDialogDrawer from "../components/projects/add-project-dialog-drawer";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list);

  return (
    <div className="p-4">
      <h1 className="md:text-2xl font-semibold">Projects</h1>
      <ul>
        {projects?.map((project) => (
          <li key={project._id}>
            <Link
              href={`/dashboard/projects/${project._id}`}
              className="cursor-pointer hover:text-primary"
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="fixed bottom-6 right-6 z-10">
        <AddProjectDialogDrawer />
      </div>
    </div>
  );
}
