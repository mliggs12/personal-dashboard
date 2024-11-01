"use client";

import dayjs from "dayjs";
import { useQuery } from "convex/react";
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

import { AddTaskWrapper } from "./add-task-button";
import TaskList from "./task-list";

export default function TasksCard() {
  const tasks = useQuery(api.tasks.doTodayTasks) || [];

  return (
    <Card className="w-1/2 ml-2">
      <CardHeader className="flex flex-row items-center border-b-2 p-3">
        <div className="grid gap-2">
          <CardTitle>Do Today Tasks</CardTitle>
          <CardDescription>Tasks due today or overdue</CardDescription>
        </div>
        <Button
          asChild
          size="sm"
          className="ml-auto gap-1"
        >
          <Link href="/tasks">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {tasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            <TaskList tasks={tasks} />
            <AddTaskWrapper />
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No tasks due today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
