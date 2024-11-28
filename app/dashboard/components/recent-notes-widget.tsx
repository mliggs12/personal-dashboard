"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function RecentNotesWidget() {
  const recentNotes = useQuery(api.notes.recent);

  return (
    <Card className="w-full">
      <CardHeader className="p-3 md:p-6 flex flex-row items-center">
        <CardTitle className="font-semibold">Recent Notes</CardTitle>
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
      <CardContent className="p-3 pt-0 md:p-6 grid gap-2">
        {recentNotes && recentNotes.length > 0 ? (
          recentNotes.map((note) => (
            <div
              key={note._id}
              className="flex items-center gap-2 cursor-pointer hover:bg-secondary w-full p-2 rounded-md"
            >
              <div className="grid gap-1">
                <p className="font-medium truncate leading-none">
                  {note.title}
                </p>
              </div>
              <div className="hidden md:flex ml-auto font-medium whitespace-nowrap">
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
