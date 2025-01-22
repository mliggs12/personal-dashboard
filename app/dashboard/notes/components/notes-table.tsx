"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doc } from "@/convex/_generated/dataModel";

dayjs.extend(relativeTime);

interface NotesTableProps {
  notes: Doc<"notes">[];
}

export default function NotesTable({ notes }: NotesTableProps) {
  const router = useRouter();

  // Sort notes by updated date
  const sortedNotes = notes.sort((a, b) => b.updated - a.updated);

  if (!notes.length) {
    return <div>No notes found</div>;
  }

  return (
    <Table>
      <TableHeader className="hidden md:table-header-group">
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedNotes.map((note) => (
          <TableRow
            key={note._id}
            onClick={() => router.push(`/dashboard/notes/${note._id}`)}
            className="cursor-pointer"
          >
            <TableCell className="max-w-[150px] truncate">
              {note.title}
            </TableCell>
            <TableCell className="w-[100px] text-nowrap">
              {note.updated !== undefined ? dayjs(note.updated).fromNow() : "-"}
            </TableCell>
            <TableCell className="w-[100px] text-nowrap">
              {dayjs(note._creationTime).format("MM/DD/YYYY")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
