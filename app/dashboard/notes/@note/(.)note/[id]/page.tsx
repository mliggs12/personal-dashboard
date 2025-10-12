"use client"

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface NoteModalProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NoteModal({ params }: NoteModalProps) {
  const { id } = use(params);
  const router = useRouter();
  const note = useQuery(api.notes.get, {
    noteId: id as Id<"notes">
  });

  const handleClose = () => {
    router.back();
  };

  if (!note) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{note.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{note.text}</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button>
            Edit Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
