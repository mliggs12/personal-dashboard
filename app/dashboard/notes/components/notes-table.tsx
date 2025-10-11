"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

dayjs.extend(relativeTime);

export default function NotesTable() {
  const router = useRouter();
  const notes = useQuery(api.notes.list);

  if (notes === undefined) {
    return <div>Loading...</div>;
  }

  // Sort notes by updated date
  const sortedNotes: Doc<"notes">[] = notes.sort(
    (a, b) => b.updated - a.updated,
  );

  return (
    <Table className="flex flex-col h-full">
      <TableHeader className="hidden md:table-header-group">
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="h-full overflow-y-scroll">
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
