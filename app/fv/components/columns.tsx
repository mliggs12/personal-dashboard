"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { TasksTableColumnHeader } from "./tasks-table-column-header";
import { DataTableRowActions } from "./tasks-table-row-action";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "_id",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Task"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <div className="w-[80px]">{row.getValue("_id").substring(0, 12)}...</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Name"
      />
    ),
    cell: ({ row }: { row: any }) => {
      return (
        <div className="max-w-[500px] truncate font-medium">
          {row.getValue("name")}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Status"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const status = statuses.find(
        (status: any) => status.value === row.getValue("status"),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row: any, id: any, value: any) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Priority"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const priority = priorities.find(
        (priority: any) => priority.value === row.getValue("priority"),
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center">
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    filterFn: (row: any, id: any, value: any) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => <DataTableRowActions row={row} />,
  },
];
