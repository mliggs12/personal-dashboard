"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useClientDate } from "@/hooks/useClientDate";

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import StatusDropdown from "./status-dropdown";
import TaskList from "./task-list";

export default function TasksCard() {
  const [status, setStatus] = useState<"today" | "deadline" | "backlog">("today");
  const { isClient, today, timezone } = useClientDate();

  // Only make queries after client hydration
  const todayTasks = useQuery(
    api.tasks.todayTasks,
    isClient && today ? { date: today } : "skip"
  );
  const deadlineTasks = useQuery(
    api.tasks.deadlineTasks,
    isClient && today ? { date: today } : "skip"
  );
  const backlogTasks = useQuery(api.tasks.backlogTasks);

  // Debug logging
  React.useEffect(() => {
    if (isClient && today) {
      console.log("[TasksCard] Query parameters:", {
        today,
        timezone,
        todayTasksCount: todayTasks?.length ?? "undefined",
        deadlineTasksCount: deadlineTasks?.length ?? "undefined",
        backlogTasksCount: backlogTasks?.length ?? "undefined",
      });
      
      // Log sample tasks to see their due dates
      if (todayTasks && todayTasks.length > 0) {
        console.log("[TasksCard] Sample todayTasks:", todayTasks.slice(0, 3).map(t => ({
          name: t.name,
          due: t.due,
          status: t.status,
          completed: t.completed,
        })));
      }
      
      if (deadlineTasks && deadlineTasks.length > 0) {
        console.log("[TasksCard] Sample deadlineTasks:", deadlineTasks.slice(0, 3).map(t => ({
          name: t.name,
          due: t.due,
          status: t.status,
          completed: t.completed,
          isTodayOrOverdue: t.due ? t.due <= today : false,
        })));
      }
    }
  }, [isClient, today, timezone, todayTasks, deadlineTasks, backlogTasks]);

  const tasks = useMemo(() => {
    let result: Doc<"tasks">[] = [];
    if (status === "today" && todayTasks) result = todayTasks;
    if (status === "deadline" && deadlineTasks) result = deadlineTasks;
    if (status === "backlog" && backlogTasks) result = backlogTasks;
    return result;
  }, [status, todayTasks, deadlineTasks, backlogTasks]);

  // Show loading state until client hydration
  if (!isClient) {
    return (
      <Card className="w-full max-w-[600px] relative max-h-[570px] sm:max-h-[467px]">
        <CardHeader className="p-3 pr-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="relative h-[445px] sm:h-[346px] p-0 border-t">
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
        <CardFooter className="h-[60px] flex items-center justify-between p-3 px-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[600px] relative max-h-[570px] sm:max-h-[467px]">
      <CardHeader className="p-3 pr-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CardTitle>My tasks</CardTitle>
            <StatusDropdown status={status} onStatusChange={setStatus} />
          </div>
          <Button
            asChild
            size="sm"
            variant="link"
            className="p-0 gap-1 text-primary-foreground underline"
          >
            <Link href="/dashboard/tasks">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative h-[445px] sm:h-[346px] p-0 border-t overflow-y-auto hide-scrollbar">
        <TaskList tasks={tasks} />
      </CardContent>

      <CardFooter className="h-[60px] flex items-center justify-between p-3 px-6 text-xs text-muted-foreground">
        {tasks.length} tasks
        <AddTaskDrawerDialog />
      </CardFooter>
    </Card>
  );
}
