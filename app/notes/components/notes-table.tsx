"use client";

import Link from "next/link";
import moment from "moment-timezone";
import { useQuery } from "convex/react";
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
import { cn } from "@/lib/utils";

export default function NotesTable() {
  const notes: Doc<"notes">[] | undefined = useQuery(api.notes.list);

  const sortedNotes = notes
    ? [...notes].sort((a, b) => moment(b.updated).diff(moment(a.updated)))
    : [];

  if (notes === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader className={cn("2xl:text-2xl")}>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className={cn("2xl:text-2xl")}>
        {sortedNotes.map((note) => (
          <TableRow key={note._id}>
            <Link
              href={`/notes/${note._id}`}
              className="contents hover:bg-secondary"
            >
              <TableCell>{note.title}</TableCell>
              <TableCell>{moment(note.updated).fromNow()}</TableCell>
              <TableCell>
                {moment(note._creationTime).format("MM/DD/YYYY")}
              </TableCell>
            </Link>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
