"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import NoteText from "../components/note-text";

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, { id });

  if (note === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <Card className="m-3 mr-7 p-4 h-full w-full shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-4xl font-semibold hover:text-primary cursor-pointer">
            {note.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex mt-0">
          <NoteText note={note} />
        </CardContent>
      </Card>
    </div>
  );
}
