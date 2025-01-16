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
  id: string;
  title: string; // summary in GEvent
  description: string;
  start: Date; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
  end: Date; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
  created: Date; // datetime in GEvent
  recurringEventId: string | null; // id of the recurring event to which this event belongs
}
