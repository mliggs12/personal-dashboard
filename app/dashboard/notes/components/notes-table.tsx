"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

export default function NotesTable() {
  const notes = useQuery(api.notes.list);

  if (notes === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map((note) => (
          <TableRow key={note._id}>
            <Link
              href={`/notes/${note._id}`}
              className="contents hover:bg-secondary"
            >
              <TableCell>{note.title}</TableCell>
              <TableCell>{dayjs(note.updated).fromNow()}</TableCell>
              <TableCell>
                {dayjs(note._creationTime).format("MM/DD/YYYY")}
              </TableCell>
            </Link>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
