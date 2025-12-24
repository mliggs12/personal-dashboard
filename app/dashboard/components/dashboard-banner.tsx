"use client";

import { useState } from "react";
import { PenTool } from "lucide-react";

import { Button } from "@/components/ui/button";
import ScratchpadDialog from "./scratch-pad/scratch-pad-dialog";

export default function DashboardBanner() {
  const [content] = useState(
    "Become the master you already are...right now, in this moment. It is the truth that you are already perfect. Surrender to this truth. You are what you think."
  );

  // const getBanner = useMutation(api.banners.get)

  // useEffect(() => {
  //   async function fetchBanner() {
  //     const result = await getBanner();
  //     result && setContent(result.content);
  //   }
  //   fetchBanner();
  // }, [getBanner]);

  return (
    <div className="hidden sm:block w-full border-2 p-4 text-xl italic">
      <div className="flex items-center justify-between">
        <h1 className="flex-1">{content}</h1>
        <div className="ml-4 flex-shrink-0">
          <ScratchpadDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <PenTool className="h-4 w-4" />
                <span>Scratch Pad</span>
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
