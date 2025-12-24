import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { formatRecurrenceText } from "@/convex/recurringTasksHelpers";

/**
 * Custom hook to get formatted recurrence text for a task
 * @param recurringTaskId - The ID of the recurring task (optional)
 * @param date - The date of the task in YYYY-MM-DD format (optional, used as reference for formatting)
 * @returns The formatted recurrence text, or null if not applicable
 */
export function useRecurrenceText(
  recurringTaskId: Id<"recurringTasks"> | undefined,
  date?: string
): string | null {
  // Fetch recurring task data if this task is part of a recurring task
  const recurringTask = useQuery(
    api.recurringTasks.get,
    recurringTaskId ? { recurringTaskId } : "skip"
  );

  // Format recurrence text for display
  if (recurringTask && recurringTask.schedule) {
    return formatRecurrenceText(
      recurringTask.schedule,
      recurringTask.recurrenceType,
      date || undefined
    );
  }

  return null;
}

