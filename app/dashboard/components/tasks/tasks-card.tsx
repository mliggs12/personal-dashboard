"use client";

import { startTransition, useEffect, useMemo,useState } from "react";
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
  const [today, setToday] = useState<string>(() => {
    const initialToday = dayjs().tz("America/Denver").format("YYYY-MM-DD");
    console.log("[TasksCard] Initial state - today:", initialToday, "- Environment:", typeof window !== "undefined" ? "CLIENT" : "SERVER", "- Timestamp:", new Date().toISOString());
    return initialToday;
  });

  // Recalculate date after client hydration when timezone is available
  // This synchronizes state with the client environment (browser timezone)
  useEffect(() => {
    const nowUTC = new Date();
    const timezone = getUserTimezone();
    const nowInTimezone = dayjs().tz(timezone);
    const clientToday = nowInTimezone.format("YYYY-MM-DD");
    
    console.log("[TasksCard] useEffect executing - Component mounted/hydrated");
    console.log("[TasksCard] Time calculation - UTC:", nowUTC.toISOString(), "- Local timezone:", timezone);
    console.log("[TasksCard] Time calculation - Local date/time:", nowInTimezone.format("YYYY-MM-DD HH:mm:ss z"), "- Local date:", clientToday);
    console.log("[TasksCard] Date calculation - Current state (today):", today, "- New calculated date:", clientToday);
    
    // Use startTransition to mark this as a non-urgent update
    startTransition(() => {
      setToday((prevToday) => {
        const newToday = prevToday !== clientToday ? clientToday : prevToday;
        if (newToday !== prevToday) {
          console.log("[TasksCard] State update - Previous today:", prevToday, "- New today:", newToday, "- Changed:", true);
        } else {
          console.log("[TasksCard] State update - Today unchanged:", prevToday, "- Skipped update");
        }
        return newToday;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run once on mount
  }, []);

  const todayTasks = useQuery(api.tasks.todayTasks, { date: today })
  const deadlineTasks = useQuery(api.tasks.deadlineTasks, { date: today })
  const backlogTasks = useQuery(api.tasks.backlogTasks)

  // Log query results when they change
  useEffect(() => {
    if (todayTasks !== undefined) {
      console.log("[TasksCard] todayTasks query result - Date param:", today, "- Count:", todayTasks.length, "- Tasks:", todayTasks.map(t => ({ id: t._id, name: t.name, due: t.due, status: t.status })));
    }
  }, [todayTasks, today]);

  useEffect(() => {
    if (deadlineTasks !== undefined) {
      console.log("[TasksCard] deadlineTasks query result - Date param:", today, "- Count:", deadlineTasks.length, "- Tasks:", deadlineTasks.map(t => ({ id: t._id, name: t.name, due: t.due, status: t.status })));
      // Log detailed comparison to help debug why tasks aren't in todayTasks
      const sampleTasks = deadlineTasks.slice(0, 5);
      console.log("[TasksCard] deadlineTasks sample analysis - Today date:", today);
      console.log("[TasksCard] Sample tasks:", sampleTasks.map(t => ({
        name: t.name,
        due: t.due,
        dueType: typeof t.due,
        comparison: t.due ? {
          stringCompare: `${t.due} <= ${today}`,
          result: t.due <= today,
          shouldBeInToday: t.due <= today && (t.status === "todo" || t.status === "in_progress") && !t.completed
        } : 'no due date',
        status: t.status,
        completed: t.completed,
        eligibleForToday: !t.completed && (t.status === "todo" || t.status === "in_progress")
      })));
    }
  }, [deadlineTasks, today]);

  useEffect(() => {
    if (backlogTasks !== undefined) {
      console.log("[TasksCard] backlogTasks query result - Count:", backlogTasks.length);
    }
  }, [backlogTasks]);

  const tasks = useMemo(() => {
    let result: Doc<"tasks">[] = [];
    if (status === "today" && todayTasks) result = todayTasks;
    if (status === "deadline" && deadlineTasks) result = deadlineTasks;
    if (status === "backlog" && backlogTasks) result = backlogTasks;
    return result;
  }, [status, todayTasks, deadlineTasks, backlogTasks]);

  // Log final tasks array when it changes
  useEffect(() => {
    console.log("[TasksCard] Final tasks array - Status:", status, "- Count:", tasks.length, "- Date used:", today, "- Tasks:", tasks.map(t => ({ id: t._id, name: t.name, due: t.due, status: t.status })));
  }, [tasks, status, today]);

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
