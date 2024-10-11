"use client";

import moment from "moment";
import { ColumnDef, Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { priorities, statuses } from "../data/data";
import { Task } from "../data/schema";

import { TasksTableColumnHeader } from "./tasks-table-column-header";
import { TasksTableRowActions } from "./tasks-table-row-action";
import IntentionCell from "./intention-cell";
import { Id } from "@/convex/_generated/dataModel";

const statusOrder = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "cancelled",
  "archived",
];

const priorityOrder = ["low", "normal", "high"];

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
    accessorKey: "name",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Task"
      />
    ),
    cell: ({ row }: { row: any }) => {
      return <div className="truncate font-medium">{row.getValue("name")}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    sortingFn: (rowA: Row<Task>, rowB: Row<Task>, columnId: string) => {
      const statusA = rowA.getValue(columnId);
      const statusB = rowB.getValue(columnId);
      const indexA = statusOrder.indexOf(statusA as string);
      const indexB = statusOrder.indexOf(statusB as string);

      // Handle cases where a status might not be in the statusOrder array
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    },
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
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
              >
                {status.icon && (
                  <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span>{status.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => {}}
                >
                  {status.icon && (
                    <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{status.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    filterFn: (row: any, id: any, value: any) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    sortingFn: (rowA: Row<Task>, rowB: Row<Task>, columnId: string) => {
      const priorityA = rowA.getValue(columnId);
      const priorityB = rowB.getValue(columnId);
      const indexA = priorityOrder.indexOf(priorityA as string);
      const indexB = priorityOrder.indexOf(priorityB as string);

      // Handle cases where a priority might not be in the priorityOrder array
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    },
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
    accessorKey: "dueAt",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Due Date"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const dueAt = row.getValue("dueAt");
      return (
        <div className="flex items-center">
          <span>{dueAt ? moment(dueAt).format("MM/DD") : ""}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "intentionId",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Intention"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const intentionId = row.getValue("intentionId");
      if (!intentionId) {
        return null;
      }
      return <IntentionCell intentionId={intentionId as Id<"intentions">} />;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Updated At"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const updatedAt = row.getValue("updatedAt");
      return <div className="truncate font-medium">{updatedAt}</div>;
    },
  },
  {
    accessorKey: "_creationTime",
    header: ({ column }: { column: any }) => (
      <TasksTableColumnHeader
        column={column}
        title="Created At"
      />
    ),
    cell: ({ row }: { row: any }) => {
      const createdAt = row.getValue("_creationTime");
      return (
        <div className="whitespace-nowrap font-medium">
          <span>
            {createdAt ? moment(createdAt).format("MM/DD/YYYY, h:mm:ss A") : ""}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => <TasksTableRowActions row={row} />,
  },
];
