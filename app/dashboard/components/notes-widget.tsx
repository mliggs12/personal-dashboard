"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NotesWidget() {
  const recentNotes = useQuery(api.notes.recent);

  return (
    <Card className="w-[400px]">
      <CardHeader className="flex flex-row">
        <CardTitle>Recent Notes</CardTitle>
        <Button
          asChild
          size="sm"
          className="ml-auto gap-1"
        >
          <Link href="/dashboard/notes">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentNotes && recentNotes.length > 0 ? (
          recentNotes.map((note) => (
            <div
              key={note._id}
              className="flex items-center gap-4"
            >
              <div className="grid gap-1">
                <p className="text-lg font-medium leading-none">{note.title}</p>
              </div>
              <div className="ml-auto text-sm font-medium">
                {new Date(note._creationTime).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p>No notes found</p>
        )}
      </CardContent>
    </Card>
  );
}
