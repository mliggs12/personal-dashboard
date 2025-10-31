"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Repeat } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";

import { TaskDueDatePicker } from "../../components/tasks/task-due-date-picker";
import { TaskPrioritySelect } from "../../components/tasks/task-priority-select";
import { TaskStatusSelect } from "../../components/tasks/task-status-select";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Doc<"tasks">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {task.name}
          </span>
          {task.recurringTaskId && (
            <Repeat className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return <TaskStatusSelect task={task} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return <TaskPrioritySelect task={task} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "due",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return <TaskDueDatePicker task={task} />;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue("due") as string | undefined;
      const dateB = rowB.getValue("due") as string | undefined;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dayjs(dateA, "YYYY-MM-DD").diff(dayjs(dateB, "YYYY-MM-DD"));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
