"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { Ellipsis, Pin, PinOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { useScratchpadPinned } from "@/hooks/use-scratchpad-pinned";

import ScratchPadEditor, { ScratchPadEditorRef } from "./scratch-pad-editor";

interface ScratchpadDialogProps {
  trigger: React.ReactNode;
}

export default function ScratchpadDialog({ trigger }: ScratchpadDialogProps) {
  const router = useRouter();
  const editorRef = useRef<ScratchPadEditorRef>(null);
  const [open, setOpen] = useState(false);
  const { isPinned, togglePinned } = useScratchpadPinned();
  const scratchPad = useQuery(api.scratchPads.getByUser);

  const createScratchPad = useMutation(api.scratchPads.create);
  const updateScratchPad = useMutation(api.scratchPads.update);
  const createNote = useMutation(api.notes.create);

  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleChange = useCallback(
    (content: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (scratchPad) {
          await updateScratchPad({ id: scratchPad._id, content });
        }
      }, 1500);
    },
    [scratchPad, updateScratchPad],
  );

  const handleConvertToNote = async () => {
    if (scratchPad) {
      const noteId = await createNote({
        title: `Scratch Pad - ${dayjs(Date.now()).format("MMM D, h:mm A")}`,
        text: scratchPad.content,
      });
      updateScratchPad({ id: scratchPad._id, content: "" });

      router.push(`/dashboard/notes/${noteId}`);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (scratchPad === null) {
      createScratchPad();
    }
  }, [scratchPad, createScratchPad]);

  if (scratchPad === undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Scratch Pad</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Scratch Pad</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  togglePinned();
                  if (!isPinned) {
                    setOpen(false);
                  }
                }}
                className="flex items-center gap-2"
                title={isPinned ? "Unpin scratchpad" : "Pin scratchpad to dashboard"}
              >
                {isPinned ? (
                  <>
                    <PinOff className="h-4 w-4" />
                    <span>Unpin</span>
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4" />
                    <span>Pin</span>
                  </>
                )}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Ellipsis />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-fit p-2">
                  <div className="grid">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleConvertToNote}
                    >
                      <span className="mr-auto">Convert to note</span>
                    </Button>
                    <ClearDialog editorRef={editorRef} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden border bg-blue-300 rounded p-4">
          <ScratchPadEditor
            ref={editorRef}
            initialContent={scratchPad?.content || ""}
            onChange={handleChange}
            className="h-full min-h-[400px] overflow-y-auto bg-blue-300 text-gray-800 prose-headings:text-gray-800 font-semibold"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ClearDialogProps {
  editorRef: React.RefObject<ScratchPadEditorRef | null>;
}

const ClearDialog = ({ editorRef }: ClearDialogProps) => {
  const handleClear = () => {
    editorRef.current?.clear();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Clear scratch pad
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear scratch pad?</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear the scratch pad? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <div className="flex gap-4">
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

