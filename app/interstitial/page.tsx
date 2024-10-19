"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectForm from "./components/project-form";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SessionsList from "./components/sessions-list";
import Timer from "./components/timer/timer";

export default function InterstitialPage() {
  const projects = useQuery(api.projects.list);
  const sessions = useQuery(api.sessions.todaySessions);

  return (
    <div className="h-full p-8 md:flex space-x-4">
      <div className="flex flex-col space-y-4">
        <Card className="min-w-[415px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm projects={projects ?? []} />
          </CardContent>
        </Card>
        <Timer />
      </div>
      <SessionsList sessions={sessions ?? []} />
      <Toaster />
    </div>
  );
}
