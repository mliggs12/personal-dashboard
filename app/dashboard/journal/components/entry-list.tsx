"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { timestampToTime } from "@/lib/date.utils";

export default function EntryList() {
  const entries = useQuery(api.journalEntries.list);

  return (
    <div>
      {entries?.map((entry) => (
        <div
          key={entry._id}
          className="flex justify-between text-base"
        >
          {entry.content}
          <span>{timestampToTime(entry._creationTime)}</span>
        </div>
      ))}
    </div>
  );
}
