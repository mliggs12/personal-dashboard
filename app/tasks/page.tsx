"use client";

import { api } from "@/convex/_generated/api";
import { columns } from "./components/columns";
import { TasksDataTable } from "./components/tasks-data-table";
import { taskSchema } from "./data/schema";
import { useConvexAuth, useQuery } from "convex/react";
import { z } from "zod";
import AddTaskButton from "./components/add-task-button";
import { Toaster } from "@/components/ui/toaster";
import { redirect } from "next/navigation";

export default function TasksPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  const tasksData = useQuery(api.tasks.list);

  if (!tasksData) return null;

  const tasks = z.array(taskSchema).parse(tasksData);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
              <p className="text-muted-foreground">
                Here&apos;s a list of all your tasks!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AddTaskButton />
            </div>
          </div>
          <TasksDataTable
            data={tasks}
            columns={columns}
          />
          <Toaster />
        </div>
      ) : (
        redirect("/login")
      )}
    </>
  );
}
