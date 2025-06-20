"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import StatusDropdown from "./status-dropdown"
import TaskList from "./task-list";

export default function TasksCard() {
  const [status, setStatus] = useState<"today" | "deadline" | "backlog">("today")

  const today = dayjs().endOf("day").format("YYYY/MM/DD")

  const todayTasks = useQuery(api.tasks.getTodayTasks, { date: today })
  const deadlineTasks = useQuery(api.tasks.deadlineTasks, { date: today })
  const backlogTasks = useQuery(api.tasks.backlogTasks)

  let tasks: Doc<"tasks">[] = []
  if (status === "today" && todayTasks) tasks = todayTasks
  if (status === "deadline" && deadlineTasks) tasks = deadlineTasks
  if (status === "backlog" && backlogTasks) tasks = backlogTasks

  return (
    <Card className="relative max-h-[467px]">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle>My tasks</CardTitle>
          <StatusDropdown status={status} onStatusChange={setStatus} />
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
      <CardContent className="relative h-[346px] p-0 border-t overflow-y-auto">
        <TaskList tasks={tasks} />
      </CardContent>

      <CardFooter className="h-[60px] flex items-center p-3 px-6 border-t">
        <div className="absolute right-2 bottom-12 z-10">
          <AddTaskDrawerDialog />
        </div>
      </CardFooter>
    </Card>
  );
}
