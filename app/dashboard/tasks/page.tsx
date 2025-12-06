"use client";

import { useQuery } from "convex/react";

import { DataTable } from "@/components/ui/data-table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useTableState } from "@/hooks/use-table-state";

import { columns } from "./components/columns";
import { DataTablePagination } from "./components/data-table-pagination";
import { DataTableToolbar } from "./components/data-table-toolbar";

export default function TasksPage() {
  const tasksQuery = useQuery(api.tasks.list);
  const tasks = tasksQuery ?? [];
  const { savedState, onStateChange } = useTableState("tasks");

  // Show loading state while savedState is being fetched
  if (tasksQuery === undefined || savedState === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-2 px-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-lg md:text-2xl font-semibold">Tasks</h2>
        </div>
      </div>
      <DataTable
        data={tasks as Doc<"tasks">[]}
        columns={columns}
        toolbar={(table) => <DataTableToolbar table={table} />}
        pagination={(table) => <DataTablePagination table={table} />}
        savedState={savedState}
        onStateChange={onStateChange}
      />
    </div>
  );
}
