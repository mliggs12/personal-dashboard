"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TableRow, TableCell } from "@/components/ui/table";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/utils";

import { deleteIntention } from "./actions";
import { revalidatePath } from "next/cache";

interface IntentionsTableRowProps {
  intention: Doc<"intentions">;
}

async function handleDelete(id: Id<"intentions">) {
  await deleteIntention(id);
}

export default function IntentionsTableRow({
  intention,
}: IntentionsTableRowProps) {
  return (
    <TableRow>
      <TableCell>{intention.title}</TableCell>
      <TableCell>{intention.status}</TableCell>
      <TableCell>{intention.emotionIds}</TableCell>
      <TableCell>{formatTimestamp(intention._creationTime)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(intention._id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
