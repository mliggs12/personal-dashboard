"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";
import { timestampToLongDate } from "@/lib/date.utils";
import dayjs from "@/lib/dayjs.config";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { IntentionEmotionSelect } from "./intention-emotion-select-inline";
import { IntentionStatusSelect } from "./intention-status-select-inline";

export const columns: ColumnDef<Doc<"intentions">>[] = [
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intention" />
    ),
    cell: ({ row }) => {
      const intention = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {intention.title}
          </span>
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
      const intention = row.original;
      return <IntentionStatusSelect intention={intention} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "emotionId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emotion" />
    ),
    cell: ({ row }) => {
      const intention = row.original;
      return <IntentionEmotionSelect intention={intention} />;
    },
    filterFn: (row, id, value) => {
      const emotionId = row.getValue(id);
      // Handle "No emotion" filter option
      if (value.includes("__no_emotion__") && !emotionId) {
        return true;
      }
      return value.includes(emotionId);
    },
  },
  {
    accessorKey: "updated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const intention = row.original;
      if (!intention.updated) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {dayjs(intention.updated).format("MMM DD, LT")}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue("updated") as number | undefined;
      const dateB = rowB.getValue("updated") as number | undefined;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateA - dateB;
    },
  },
  {
    accessorKey: "_creationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const intention = row.original;
      return (
        <span className="text-sm">
          {timestampToLongDate(intention._creationTime)}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue("_creationTime") as number | undefined;
      const dateB = rowB.getValue("_creationTime") as number | undefined;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateA - dateB;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

