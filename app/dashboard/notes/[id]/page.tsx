"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import NoteText from "../components/note-text";

dayjs.extend(localizedFormat);

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { noteId: id });

  if (note === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="px-4">
      <div className="flex flex-col mb-4 gap-2">
        <div className="text-lg w-full">{note!.title}</div>
        <div className="text-xs text-muted-foreground">
          Updated: {dayjs(note!.updated).format("lll")}
        </div>
      </div>
      <div className="flex flex-col flex-1 h-full">
        {/* <NoteText note={note!} /> */}
        <textarea
          aria-label="Note content"
          placeholder="Note"
        />
      </div>
    </div>
  );
}
