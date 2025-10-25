"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";

import CreateIntentionDialog from "../../../components/create-intention-dialog";
import { statuses } from "../data/data";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const emotions = useQuery(api.emotions.list) ?? [];

  const emotionOptions = [
    { label: "No emotion", value: "__no_emotion__" },
    ...emotions.map((emotion) => ({
      label: emotion.label,
      value: emotion._id,
    })),
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter intentions..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("emotionId") && (
          <DataTableFacetedFilter
            column={table.getColumn("emotionId")}
            title="Emotion"
            options={emotionOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        <CreateIntentionDialog>
          <Button size="sm" className="h-8">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Intention
          </Button>
        </CreateIntentionDialog>
      </div>
    </div>
  );
}

