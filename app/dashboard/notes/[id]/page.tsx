"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import NoteText from "../note-text";

export default function NotePage() {
  const { id } = useParams<{ id: Id<"notes"> }>();
  const note = useQuery(api.notes.get, {
    id: id,
  });

  if (note === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <Card className="min-w-[750px] min-h-[1100px]">
      <CardHeader>
        <CardTitle className="text-4xl hover:text-primary cursor-pointer">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <NoteText note={note} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
