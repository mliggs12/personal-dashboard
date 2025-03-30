import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ListsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="header flex items-center justify-between border-b bg-secondary/50 p-4">
        <h1 className="font-semibold text-xl">Lists</h1>
        <div className="menu-items">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon"
                className="p-2 prose dark:prose-invert"
              >
                <Plus />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-fit p-2">
              <div className="grid">
                <Button variant="ghost" size="sm" className="prose dark:prose-invert">
                  <span className="mr-auto">Create List</span>
                </Button>
                <Button variant="ghost" size="sm" disabled className="prose dark:prose-invert">
                  <span className="mr-auto">Create Folder</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
