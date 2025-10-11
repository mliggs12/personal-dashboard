"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Doc } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";

import { AddTaskForm } from "./add-task-form";

export default function AddTaskDialog({
  setShowAddTask,
}: {
  setShowAddTask: Dispatch<SetStateAction<boolean>>;
  parentTask?: Doc<"tasks">;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 m-4 z-0"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <AddTaskForm onSubmit={() => setOpen(false)} />
          <DrawerFooter className="pt-0">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div>
      <AddTaskForm />
      <CardFooter className="flex flex-col lg:flex-row lg:justify-between gap-2 border-t-2 pt-3">
        <div className="w-full" />
        <div className="flex gap-3 self-end">
          <Button
            className="bg-secondary text-secondary-foreground px-6 hover:bg-secondary/90"
            variant={"outline"}
            onClick={() => setShowAddTask(false)}
          >
            Cancel
          </Button>
          <Button
            className="px-6"
            type="submit"
          >
            Add Task
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}
