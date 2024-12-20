import { Doc } from "@/convex/_generated/dataModel";

export type Task = Doc<"tasks">;

export type RecurringTask = Doc<"recurringTasks">;

export interface RecurringTasksTableProps {
  recurringTasks: RecurringTask[];
}

export type MessageWithUserType = Doc<"messages"> & {
  user: Doc<"users">;
};
