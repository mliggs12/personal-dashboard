import { Doc } from "@/convex/_generated/dataModel";

// Tasks
export type Task = Doc<"tasks">;

export type RecurringTask = Doc<"recurringTasks">;

export interface RecurringTasksTableProps {
  recurringTasks: RecurringTask[];
}

// Chat
export type MessageWithUserType = Doc<"messages"> & {
  user: Doc<"users">;
};

// Calendar
export interface Event {
  id: string; // id in GEvent
  summary: string; // summary in GEvent
  start: string; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
  end: string; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
}
