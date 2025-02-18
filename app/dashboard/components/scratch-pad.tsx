import { useMutation, useQuery } from "convex/react";
import { Ellipsis } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter, DialogHeader, Dialog, DialogTrigger, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import TiptapEditor from "./tiptap-editor";

export default function ScratchPad() {
  const scratchPad = useQuery(api.scratchPads.getByUser);

  const createScratchPad = useMutation(api.scratchPads.create);
  const updateScratchPad = useMutation(api.scratchPads.update);

  const timeoutRef = useRef<NodeJS.Timeout>();

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

  useEffect(() => {
    if (scratchPad === null) {
      createScratchPad();
    }
  }, [scratchPad, createScratchPad]);

  if (!scratchPad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-[600px]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="prose dark:prose-invert text-lg font-semibold">Scratch Pad</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm"
              className="p-2">
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-fit p-2">
            <div className="grid">
              <Button variant="ghost" size="sm" disabled className="prose dark:prose-invert">
                <span className="mr-auto">Convert to note</span>
              </Button>
              <ClearDialog {...scratchPad} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="border bg-blue-300 rounded p-4">
        <TiptapEditor
          initialContent={scratchPad.content}
          onChange={handleChange}
          className="h-[300px] overflow-y-auto bg-blue-300 text-gray-800 prose-headings:text-gray-800 font-semibold"
        />
      </div>
    </div>
  );
}

const ClearDialog = (scratchPad: Doc<"scratchPads">) => {
  const updateScratchPad = useMutation(api.scratchPads.update);

  const handleClear = async () => {
    await updateScratchPad({ id: scratchPad._id, content: "" });
    // Refresh the page to clear the editor
    // window.location.reload();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled className="prose dark:prose-invert">Clear scratch pad</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Clear scratch pad?</DialogHeader>
        <DialogDescription>Are you sure you want to clear the scratch pad? This action cannot be undone.</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <div className="flex gap-4">
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive" onClick={handleClear}>Clear</Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}