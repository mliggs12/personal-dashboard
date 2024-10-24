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

export default function NotesTable() {
  const notes: Doc<"notes">[] | undefined = useQuery(api.notes.list);

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
              <TableCell>{note.updated}</TableCell>
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
