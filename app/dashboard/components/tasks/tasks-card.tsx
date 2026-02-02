"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useClientDate } from "@/hooks/useClientDate";
import { normalizeDateString } from "@/lib/date.utils";

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import StatusDropdown from "./status-dropdown";
import { TagFilterDropdown } from "./tag-filter-dropdown";
import TaskList from "./task-list";

const INCLUDED_TAGS_STORAGE_KEY = "tasksCard:includedTagIds";
const INCLUDE_NO_TAGS_STORAGE_KEY = "tasksCard:includeNoTags";

// Helper to get initial includedTagIds from localStorage
function getInitialIncludedTagIds(): Id<"tags">[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(INCLUDED_TAGS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

// Helper to get initial includeNoTags from localStorage
function getInitialIncludeNoTags(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(INCLUDE_NO_TAGS_STORAGE_KEY);
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch {
      return true;
    }
  }
  return true;
}

export default function TasksCard() {
  const [status, setStatus] = useState<"today" | "deadline" | "backlog">("today");
  const [includedTagIds, setIncludedTagIds] = useState<Id<"tags">[]>(getInitialIncludedTagIds);
  const [includeNoTags, setIncludeNoTags] = useState<boolean>(getInitialIncludeNoTags);
  const { isClient, today } = useClientDate();

  // Fetch tags to determine default state
  const tags = useQuery(api.tags.list);
  const hasInitialized = useRef(false);

  // Update includedTagIds to default (all tags) if no stored value exists and tags are loaded
  useEffect(() => {
    if (!tags || !isClient || hasInitialized.current) return;
    
    // Only set default if no stored value exists (empty array means no stored value)
    const storedTags = localStorage.getItem(INCLUDED_TAGS_STORAGE_KEY);
    if (!storedTags && tags.length > 0) {
      startTransition(() => {
        setIncludedTagIds(tags.map((tag) => tag._id));
      });
    }
    
    hasInitialized.current = true;
  }, [tags, isClient]);

  // Save included tags to localStorage when changed
  const handleIncludedTagsChange = (tagIds: Id<"tags">[]) => {
    setIncludedTagIds(tagIds);
    localStorage.setItem(INCLUDED_TAGS_STORAGE_KEY, JSON.stringify(tagIds));
  };

  // Save includeNoTags to localStorage when changed
  const handleIncludeNoTagsChange = (value: boolean) => {
    setIncludeNoTags(value);
    localStorage.setItem(INCLUDE_NO_TAGS_STORAGE_KEY, JSON.stringify(value));
  };

  // Fetch all active tasks once
  const allActiveTasks = useQuery(
    api.tasks.allActiveTasks,
    isClient ? {} : "skip"
  );

  // Helper to check if a task matches the status filter (without tag filtering)
  const matchesStatusFilter = useCallback((task: Doc<"tasks">): boolean => {
    if (!allActiveTasks || !today) return false;
    
    const normalizedToday = normalizeDateString(today) ?? today;

    if (status === "today") {
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
    } else if (status === "backlog") {
      return task.status === "backlog";
    } else if (status === "deadline") {
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
    }
    return false;
  }, [status, allActiveTasks, today]);

  const tasks = useMemo(() => {
    if (!allActiveTasks || !today) return [];

    // Normalize today's date (handles both YYYY-MM-DD and YYYY/MM/DD formats)
    const normalizedToday = normalizeDateString(today) ?? today;

    // Helper to check if a task matches the included tags filter
    const matchesTagFilter = (task: Doc<"tasks">) => {
      const hasNoTags = !task.tagIds || task.tagIds.length === 0;
      
      // Handle tasks with no tags
      if (hasNoTags) {
        return includeNoTags;
      }
      
      // If no tags are selected, show all tasks (but we already handled no-tag tasks above)
      if (includedTagIds.length === 0) return false;
      // If all available tags are selected, show all tasks (same as no filter)
      if (tags && includedTagIds.length === tags.length) return true;
      // Show task only if ALL of its tags are selected (if any tag is unselected, filter it out)
      return task.tagIds?.every((tagId) => includedTagIds.includes(tagId)) ?? false;
    };

    let filtered: Doc<"tasks">[] = [];

    if (status === "today") {
      // Today: status === "todo" | "in_progress" AND (due <= today OR date <= today OR (due === undefined AND date === undefined))
      filtered = allActiveTasks.filter((task) => {
        // Apply tag filter
        if (!matchesTagFilter(task)) return false;

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
      filtered = allActiveTasks.filter((task) => {
        if (!matchesTagFilter(task)) return false;
        return task.status === "backlog";
      });
      
      // Sort by last update (oldest first) or creation date
      filtered.sort((a, b) => {
        const aTime = a.updated || a._creationTime;
        const bTime = b.updated || b._creationTime;
        return aTime - bTime;
      });
    } else if (status === "deadline") {
      // Deadline/Upcoming: (due !== undefined AND due > today) OR (date !== undefined AND date > today) AND status !== "archived"
      filtered = allActiveTasks.filter((task) => {
        // Apply tag filter
        if (!matchesTagFilter(task)) return false;

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
  }, [status, allActiveTasks, today, includedTagIds, includeNoTags, tags]);

  // Calculate number of tasks filtered out by tag filter
  const filteredOutTaskCount = useMemo(() => {
    if (!allActiveTasks || !tags) return 0;
    
    // If all tags are selected and no tags are included, check if we're filtering anything
    const allTagsSelected = includedTagIds.length === tags.length;
    const noTagsSelected = includedTagIds.length === 0;
    
    // If all tags selected and includeNoTags is true, nothing is filtered out
    if (allTagsSelected && includeNoTags) {
      return 0;
    }
    
    // If no tags selected and includeNoTags is false, everything is filtered out
    if (noTagsSelected && !includeNoTags) {
      const tasksMatchingStatus = allActiveTasks.filter(matchesStatusFilter);
      return tasksMatchingStatus.length;
    }

    // Count tasks that match status but are filtered out by tags
    const tasksMatchingStatus = allActiveTasks.filter(matchesStatusFilter);
    const tasksMatchingStatusAndTags = tasksMatchingStatus.filter((task) => {
      const hasNoTags = !task.tagIds || task.tagIds.length === 0;
      // Handle tasks with no tags
      if (hasNoTags) {
        return includeNoTags;
      }
      // If no tags are selected, tasks with tags don't match
      if (noTagsSelected) return false;
      // Task matches if ALL of its tags are selected
      return task.tagIds?.every((tagId) => includedTagIds.includes(tagId)) ?? false;
    });

    return tasksMatchingStatus.length - tasksMatchingStatusAndTags.length;
  }, [allActiveTasks, tags, includedTagIds, includeNoTags, matchesStatusFilter]);

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
    <Card className="w-full max-w-[550px] relative flex flex-col h-[570px] sm:h-[478px]">
      <CardHeader className="p-3 pr-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CardTitle>My tasks</CardTitle>
            <div className="flex items-center gap-1">
              <StatusDropdown status={status} onStatusChange={setStatus} />
              <TagFilterDropdown
                includedTagIds={includedTagIds}
                onIncludedTagsChange={handleIncludedTagsChange}
                includeNoTags={includeNoTags}
                onIncludeNoTagsChange={handleIncludeNoTagsChange}
                filteredOutTaskCount={filteredOutTaskCount}
              />
            </div>
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
