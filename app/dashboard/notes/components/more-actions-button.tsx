import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function MoreActionsButton({ id }: { id: Id<"notes"> }) {
  const [open, setOpen] = useState(false);
  const router = useRouter()
  const deleteNote = useMutation(api.notes.deleteNote);

  const handleDelete = () => {
    router.push("/dashboard/notes")
    deleteNote({ id })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="hover:bg-secondary"
          size="sm"
          variant="ghost"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          className="text-destructive"
          onSelect={handleDelete}
        >
          <Trash2 /> Delete note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}