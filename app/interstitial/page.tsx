"use client";

import { useMutation, useQuery } from "convex/react";
import ProjectSelect from "./components/project-select";
import { api } from "@/convex/_generated/api";
import ProjectForm from "./components/project-form";
import AddProjectDialog from "./components/add-project-dialog";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InterstitialPage() {
  const projects = useQuery(api.projects.list) ?? [];
  const createProject = useMutation(api.projects.create);

  return (
    <div className="h-full p-8 md:flex">
      {/* <ProjectSelect projects={projects} /> */}
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm projects={projects} />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
