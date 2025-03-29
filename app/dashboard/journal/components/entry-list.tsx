"use client";

import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { api } from "@/convex/_generated/api";
import { timestampToShortDateTime } from "@/lib/date.utils";

import TypeButton from "./type-button";

export default function EntryList() {
  const entries = useQuery(api.journalEntries.list);

  const removeEntry = useMutation(api.journalEntries.remove);

  return (
    <>
      {entries?.map((entry) => (
        <div
          key={entry._id}
          className="flex w-full"
        >
          <Collapsible className="w-full">

            <div className="flex justify-between gap-2 w-full">
              <TypeButton entryId={entry._id} entryType={entry.type} />
              <div className="flex flex-1 w-full break-words md:text-lg">
                {entry.content}
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground text-right text-sm whitespace-nowrap p-1 h-6">
                  {timestampToShortDateTime(entry._creationTime)}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => removeEntry({ id: entry._id })} className="rounded-2xl h-8 text-destructive hover:text-destructive hover:bg-red-900 hover:bg-opacity-25">Delete</Button>
                <Button size="sm" className="rounded-2xl h-8" disabled>Update</Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </>
  );
}

