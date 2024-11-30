import { Plus } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuAction } from "@/components/ui/sidebar";

import AddNoteForm from "./add-note-form";

export default function AddNoteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <SidebarMenuAction>
          <Plus /> <span className="sr-only">Add</span>
        </SidebarMenuAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-4xl">Add new note</DialogTitle>
        </DialogHeader>
        <AddNoteForm onNoteCreated={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
