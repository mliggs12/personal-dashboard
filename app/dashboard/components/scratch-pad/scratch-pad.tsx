import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";

import ScratchPadEditor, { ScratchPadEditorRef } from "./scratch-pad-editor";

export default function ScratchPad() {
  const router = useRouter();
  const editorRef = useRef<ScratchPadEditorRef>(null);
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
    }
  }

  useEffect(() => {
    if (scratchPad === null) {
      createScratchPad();
    }
  }, [scratchPad, createScratchPad]);

  if (scratchPad === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[600px]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="prose dark:prose-invert text-lg font-semibold">Scratch Pad</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm"
              className="p-2 prose dark:prose-invert">
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-fit p-2">
            <div className="grid">
              <Button variant="ghost" size="sm" onClick={handleConvertToNote} className="prose dark:prose-invert">
                <span className="mr-auto">Convert to note</span>
              </Button>
              <ClearDialog editorRef={editorRef} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="border bg-blue-300 rounded p-4">
        <ScratchPadEditor
          ref={editorRef}
          initialContent={scratchPad?.content || ""}
          onChange={handleChange}
          className="h-[300px] overflow-y-auto bg-blue-300 text-gray-800 prose-headings:text-gray-800 font-semibold"
        />
      </div>
    </div>
  );
}

interface ClearDialogProps {
  editorRef: React.RefObject<ScratchPadEditorRef | null>;
}

const ClearDialog = ({ editorRef }: ClearDialogProps) => {

  const handleClear = () => {
    editorRef.current?.clear();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="prose dark:prose-invert">Clear scratch pad</Button>
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