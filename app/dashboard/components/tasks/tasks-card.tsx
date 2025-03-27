"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { AddTaskWrapper } from "./add-task-button";
import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import TaskList from "./task-list";

function orderTasks(tasks: Doc<"tasks">[]) {
  // Order tasks: first by deadline (if exists), then by updated timestamp
  const orderedTasks = tasks.sort((a, b) => {
    // If neither task has a deadline, sort by updated timestamp (newest first)
    if (!a.due && !b.due) {
      return dayjs(b.updated).valueOf() - dayjs(a.updated).valueOf();
    }
    // If only one task has a deadline, prioritize the task with deadline
    if (!a.due) return 1; // a goes after b
    if (!b.due) return -1; // a goes before b

    // If both tasks have deadlines, compare them
    const dateComparison = dayjs(a.due).valueOf() - dayjs(b.due).valueOf();
    // If deadlines are the same, sort by updated timestamp
    return dateComparison === 0
      ? dayjs(b.updated).valueOf() - dayjs(a.updated).valueOf()
      : dateComparison;
  });

  return orderedTasks;
}

// TODO: Set or remove Backlog task logic
export default function TasksCard() {
  const clientTimezone = dayjs.tz.guess();
  const tasks = useQuery(api.tasks.doTodayTasks, { clientTimezone }) || [];
  const orderedTasks = orderTasks(tasks);
  const backlogTasks = useQuery(api.tasks.backlogTasks) || [];
  const orderedBacklogTasks = orderTasks(backlogTasks);

  const isMobile = useIsMobile();

  if (tasks.length === 0) {
    return (
      <Card
        className={cn(
          "flex flex-col h-full min-h-[350px] md:h-1/2",
          isMobile && "border-none",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between border-b-2 p-3">
          <div className="flex flex-col gap-2 p-0">
            <CardTitle>Backlog Tasks</CardTitle>
            <CardDescription>
              There are no urgent tasks. Add a new task to switch back to Do
              Today.
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            className="gap-1"
          >
            <Link href="/tasks">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col gap-2 p-0 pb-4 overflow-auto">
            <TaskList tasks={orderedBacklogTasks} />
            <AddTaskWrapper />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <CardHeader className="flex flex-row items-start justify-between border-b-2 p-3">
        <div className="flex flex-col gap-2 p-0">
          <CardTitle>Do Today Tasks</CardTitle>
          <CardDescription>Tasks due today or overdue</CardDescription>
        </div>
        <Button
          asChild
          size="sm"
          className="gap-1"
        >
          <Link href="/dashboard/tasks">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full gap-2 p-0">
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto px-2">
            <div className="pb-6">
              <TaskList tasks={orderedTasks} />
            </div>
            <div className="sticky bottom-2 z-10 flex justify-end">
              <AddTaskDrawerDialog />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
