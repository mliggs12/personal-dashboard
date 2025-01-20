"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { timestampToTime } from "@/lib/date.utils";

export default function EntryList() {
  const entries = useQuery(api.journalEntries.list);

  return (
    <div className="grid grid-cols-[1fr,auto] gap-x-4 gap-y-4">
      {entries?.map((entry) => (
        <>
          <div
            key={entry._id}
            className="text-base break-words"
          >
            {entry.content}
          </div>
          <div className="text-base text-muted-foreground whitespace-nowrap">
            {timestampToTime(entry._creationTime)}
          </div>
        </>
      ))}
    </div>
  );
}
