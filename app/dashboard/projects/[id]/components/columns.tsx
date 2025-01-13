"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { timestampToDateTime } from "@/lib/date.utils";
import { Task } from "@/types";

const UserCell = ({ userId }: { userId: string }) => {
  const user = useQuery(api.users.get, { userId: userId as Id<"users"> });

  if (user === undefined)
    return <div className="animate-pulse">Loading...</div>;

  return <div>{user!.name}</div>;
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Task</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => {
      return <div className="">{row.original.status}</div>;
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "due",
    header: "Due Date",
  },
  {
    accessorKey: "updated",
    header: () => <div>Updated</div>,
    cell: ({ row }) => {
      return <div>{timestampToDateTime(row.original.updated!)}</div>;
    },
  },
  {
    accessorKey: "userId",
    header: () => <div>Created By</div>,
    cell: ({ row }) => {
      return <UserCell userId={row.original.userId!} />;
    },
  },
  {
    accessorKey: "completed",
    header: "Completed",
  },
];
