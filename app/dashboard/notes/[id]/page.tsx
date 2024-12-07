"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useParams } from "next/navigation";
import NoteText from "../components/note-text";

dayjs.extend(localizedFormat);

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { noteId: id });

  if (note === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center h-full">
      <Card className="m-3 mr-7 p-4 h-full w-full shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-4xl font-semibold hover:text-primary cursor-pointer">
            {note!.title}
          </CardTitle>
          <CardDescription>
            Updated: {dayjs(note!.updated).format("lll")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-full mt-0 border-2">
          <NoteText note={note!} />
        </CardContent>
      </Card>
    </div>
  );
}
