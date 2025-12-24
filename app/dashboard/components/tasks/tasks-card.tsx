"use client";

import { useMemo, useState } from "react";
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
import { normalizeDateString } from "@/lib/date.utils";

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import StatusDropdown from "./status-dropdown";
import TaskList from "./task-list";

export default function TasksCard() {
  const [status, setStatus] = useState<"today" | "deadline" | "backlog">("today");
  const { isClient, today } = useClientDate();

  // Fetch all active tasks once
  const allActiveTasks = useQuery(
    api.tasks.allActiveTasks,
    isClient ? {} : "skip"
  );

  const tasks = useMemo(() => {
    if (!allActiveTasks || !today) return [];

    // Normalize today's date (handles both YYYY-MM-DD and YYYY/MM/DD formats)
    const normalizedToday = normalizeDateString(today) ?? today;

    let filtered: Doc<"tasks">[] = [];

    if (status === "today") {
      // Today: status === "todo" | "in_progress" AND (due <= today OR date <= today OR (due === undefined AND date === undefined))
      filtered = allActiveTasks.filter((task) => {
        const isActiveStatus = task.status === "todo" || task.status === "in_progress";
        if (!isActiveStatus) return false;

        // Check if due <= today
        if (task.due) {
          const normalizedDue = normalizeDateString(task.due);
          if (normalizedDue && normalizedDue <= normalizedToday) {
            return true;
          }
        }

        // Check if date <= today (includes past dates and today)
        if (task.date) {
          const normalizedDate = normalizeDateString(task.date);
          if (normalizedDate && normalizedDate <= normalizedToday) {
            return true;
          }
        }

        // Check if no due and no date (todo tasks with no dates)
        if (!task.due && !task.date) {
          return true;
        }

        return false;
      });

      // Sort: by due date (earliest first), then by date, then no date
      filtered.sort((a, b) => {
        // Both have due dates
        if (a.due && b.due) {
          const normalizedA = normalizeDateString(a.due) ?? a.due;
          const normalizedB = normalizeDateString(b.due) ?? b.due;
          return normalizedA.localeCompare(normalizedB);
        }
        // Only a has due date
        if (a.due) return -1;
        // Only b has due date
        if (b.due) return 1;
        // Both have date
        if (a.date && b.date) {
          return a.date.localeCompare(b.date);
        }
        // Only a has date
        if (a.date) return -1;
        // Only b has date
        if (b.date) return 1;
        // Neither has due or date
        return 0;
      });
    } else if (status === "backlog") {
      // Backlog: status === "backlog"
      filtered = allActiveTasks.filter((task) => task.status === "backlog");
      
      // Sort by creation date (newest first) or updated date
      filtered.sort((a, b) => {
        const aTime = a.updated || a._creationTime;
        const bTime = b.updated || b._creationTime;
        return bTime - aTime;
      });
    } else if (status === "deadline") {
      // Deadline/Upcoming: (due !== undefined AND due > today) OR (date !== undefined AND date > today) AND status !== "archived"
      filtered = allActiveTasks.filter((task) => {
        if (task.status === "archived") return false;
        
        // Check if due date is in the future
        if (task.due) {
          const normalizedDue = normalizeDateString(task.due);
          if (normalizedDue && normalizedDue > normalizedToday) {
            return true;
          }
        }
        
        // Check if date is in the future
        if (task.date) {
          const normalizedDate = normalizeDateString(task.date);
          if (normalizedDate && normalizedDate > normalizedToday) {
            return true;
          }
        }
        
        return false;
      });

      // Sort by due date or date (earliest first)
      filtered.sort((a, b) => {
        // Get the earliest future date for each task (due or date)
        const getEarliestFutureDate = (task: Doc<"tasks">) => {
          let earliest: string | undefined;
          
          if (task.due) {
            const normalizedDue = normalizeDateString(task.due);
            if (normalizedDue && normalizedDue > normalizedToday) {
              earliest = normalizedDue;
            }
          }
          
          if (task.date) {
            const normalizedDate = normalizeDateString(task.date);
            if (normalizedDate && normalizedDate > normalizedToday) {
              if (!earliest || normalizedDate < earliest) {
                earliest = normalizedDate;
              }
            }
          }
          
          return earliest;
        };
        
        const aDate = getEarliestFutureDate(a);
        const bDate = getEarliestFutureDate(b);
        
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.localeCompare(bDate);
      });
    }

    return filtered;
  }, [status, allActiveTasks, today]);

  // Show loading state until client hydration
  if (!isClient) {
    return (
      <Card className="w-full max-w-[600px] relative flex flex-col h-[570px] sm:h-[478px]">
        <CardHeader className="p-3 pr-2 shrink-0">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="relative flex-1 min-h-0 p-0 border-t">
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
        <CardFooter className="h-[60px] shrink-0 flex items-center justify-between p-3 px-6 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[600px] relative flex flex-col h-[570px] sm:h-[478px]">
      <CardHeader className="p-3 pr-2 shrink-0">
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
      <CardContent className="relative flex-1 min-h-0 p-0 border-t overflow-y-auto hide-scrollbar">
        <TaskList tasks={tasks} />
      </CardContent>

      <CardFooter className="h-[62px] md:h-[70px] border-t shrink-0 flex items-center justify-between p-3 px-6 text-xs text-muted-foreground">
        {tasks.length} tasks
        <AddTaskDrawerDialog />
      </CardFooter>
    </Card>
  );
}
