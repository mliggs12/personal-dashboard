import { useMutation, useQuery } from "convex/react";
import { Ellipsis } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";

import TiptapEditor from "./tiptap-editor";

export default function ScratchPad() {
  const scratchPad = useQuery(api.scratchPads.getByUser);

  const createScratchPad = useMutation(api.scratchPads.create);
  const updateScratchPad = useMutation(api.scratchPads.update);


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
          <PopoverContent align="end" className="w-fit">
            <div className="grid gap-2 text-gray-800 text-sm p-0">
              <div>Convert to note</div>
              <div>Clear scratch pad</div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="border bg-blue-300 rounded p-4">
        <TiptapEditor
          initialContent={scratchPad.content}
          onChange={(content) => updateScratchPad({ scratchPad: scratchPad._id, content })}
          className="h-[300px] overflow-y-auto bg-blue-300 text-gray-800 prose-headings:text-gray-800 font-semibold"
        />
      </div>
    </div>
  );
}