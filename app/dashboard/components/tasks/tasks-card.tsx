"use client";

import { startTransition,useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { getUserTimezone } from "@/lib/date.utils";

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import StatusDropdown from "./status-dropdown";
import TaskList from "./task-list";

export default function TasksCard() {
  const [status, setStatus] = useState<"today" | "deadline" | "backlog">("today")
  
  // Calculate today's date client-side after hydration to ensure correct timezone
  // Initialize with a safe default (America/Denver timezone for SSR compatibility)
  const [today, setToday] = useState<string>(() => 
    dayjs().tz("America/Denver").format("YYYY-MM-DD")
  )

  // Recalculate date after client hydration when timezone is available
  // This synchronizes state with the client environment (browser timezone)
  useEffect(() => {
    const timezone = getUserTimezone();
    const clientToday = dayjs().tz(timezone).format("YYYY-MM-DD");
    // Use startTransition to mark this as a non-urgent update
    startTransition(() => {
      setToday((prevToday) => (prevToday !== clientToday ? clientToday : prevToday));
    });
  }, []);

  const todayTasks = useQuery(api.tasks.todayTasks, { date: today })
  const deadlineTasks = useQuery(api.tasks.deadlineTasks, { date: today })
  const backlogTasks = useQuery(api.tasks.backlogTasks)

  let tasks: Doc<"tasks">[] = []
  if (status === "today" && todayTasks) tasks = todayTasks
  if (status === "deadline" && deadlineTasks) tasks = deadlineTasks
  if (status === "backlog" && backlogTasks) tasks = backlogTasks

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
