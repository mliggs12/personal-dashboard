"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { columns } from "./_components/data-table/columns";
import { DataTable } from "./_components/data-table/data-table";

export default function NotesPage() {
  const unprocessedRecords = useQuery(api.inboxRecords.getUnprocessed);

  return (
    <div className="flex flex-col h-full md:px-4">
      <h1 className="hidden md:block font-semibold text-2xl">Inbox</h1>
      {unprocessedRecords === undefined ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={unprocessedRecords} />
      )}
    </div>
  );
}
