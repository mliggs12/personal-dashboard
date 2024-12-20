"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

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
          <TableHead className="hidden md:block md:w-[350px]">Title</TableHead>
          <TableHead className="hidden md:block">Updated</TableHead>
          <TableHead className="hidden md:block">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map((note) => (
          <TableRow key={note._id}>
            <Link
              href={`/dashboard/notes/${note._id}`}
              className="hover:bg-secondary"
            >
              <TableCell className="md:block md:w-[350px]">
                {note.title}
              </TableCell>
              <TableCell className="hidden md:block md:w-[350px]">
                {note.updated !== undefined
                  ? dayjs(note.updated).fromNow()
                  : "-"}
              </TableCell>
              <TableCell className="hidden md:block md:w-[350px]">
                {dayjs(note._creationTime).format("MM/DD/YYYY")}
              </TableCell>
            </Link>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
