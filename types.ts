import { Id } from "./convex/_generated/dataModel";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "done"
  | "cancelled"
  | "archived";
export type TaskPriority = "low" | "normal" | "high";
export type TaskFrequency = "daily" | "weekly" | "monthly";

export interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  name: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  notes?: string;
  due?: string; // YYYY-MM-DD
  completed?: number;
  updated?: number;
  frequency?: TaskFrequency;
  recurCount?: number;
  recurringTaskId?: Id<"tasks">;
  intentionId?: Id<"intentions">;
  parentTaskId?: Id<"tasks">;
}
