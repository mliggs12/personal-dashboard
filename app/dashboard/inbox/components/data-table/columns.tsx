"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import { InboxRecord } from "@/types"

import { DataTableColumnHeader } from "./data-table-column-header"

export const columns: ColumnDef<InboxRecord>[] = [
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
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" className="flex w-[100px]" />
    ),
    cell: ({ row }) => {
      return (
        <span>{row.getValue("content")}</span>
      )
    },
  },
  {
    accessorKey: "updated",
    header: "Updated",
  },
  {
    accessorKey: "_creationTime",
    header: "Created",
  },
]
