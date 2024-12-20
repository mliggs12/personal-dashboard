declare type Task = Doc<"tasks">;

declare type RecurringTask = Doc<"recurringTasks">;

declare interface RecurringTasksTableProps {
  recurringTasks: RecurringTask[];
}

declare type MessageWithUserType = Doc<"messages"> & {
  user: Doc<"users">;
};
