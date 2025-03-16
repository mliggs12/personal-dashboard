"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { timestampToTime } from "@/lib/date.utils";

import TypeButton from "./type-button";

export default function EntryList() {
  const entries = useQuery(api.journalEntries.list);

  return (
    <>
      {entries?.map((entry) => (
        <div
          key={entry._id}
          className="flex w-full items-center gap-2 md:gap-4"
        >
          <TypeButton entryId={entry._id} entryType={entry.type} />
          <div className="grow break-words">
            {entry.content}
          </div>
          <div className="text-muted-foreground text-right whitespace-nowrap">
            {timestampToTime(entry._creationTime)}
          </div>
        </div>
      ))}
    </>
  );
}

