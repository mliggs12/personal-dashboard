"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { useNotesSidebar } from "../context/notes-sidebar-context";

dayjs.extend(relativeTime);

export default function NotesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { setMobileMenuOpen } = useNotesSidebar();
  const notes = useQuery(api.notes.list);

  // Extract current note ID from pathname
  const currentNoteId = pathname?.split('/').pop();

  const handleNoteClick = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  if (notes === undefined) {
    return <div className="p-4">Loading...</div>;
  }

  // Sort notes by updated date
  const sortedNotes: Doc<"notes">[] = notes.sort(
    (a, b) => b.updated - a.updated,
  );

  return (
    <div className="h-full overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? "w-[60%]" : "w-[260px]"}>Title</TableHead>
            <TableHead className={isMobile ? "w-[40%]" : "w-[120px]"}>Updated</TableHead>
            {!isMobile && <TableHead className="w-[110px]">Created</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedNotes.map((note) => {
            const isActive = note._id === currentNoteId;
            return (
              <TableRow
                key={note._id}
                onClick={() => handleNoteClick(note._id)}
                className={cn(
                  "cursor-pointer",
                  isActive && "bg-accent"
                )}
              >
                <TableCell className={cn(
                  isMobile ? "truncate max-w-[200px]" : "w-[260px] truncate max-w-[260px]",
                  isActive && "font-semibold"
                )}>
                  {note.title}
                </TableCell>
                <TableCell className={isMobile ? "text-xs text-nowrap" : "w-[120px] text-nowrap"}>
                  {note.updated !== undefined ? dayjs(note.updated).fromNow() : "-"}
                </TableCell>
                {!isMobile && (
                  <TableCell className="w-[110px] text-nowrap">
                    {dayjs(note._creationTime).format("MM/DD/YYYY")}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
