import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

import { AddTaskForm } from "./add-task-form";

interface AddTaskDrawerDialogProps {
  children?: React.ReactNode;
}

export default function AddTaskDrawerDialog({ children }: AddTaskDrawerDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          {children || (
            <Button
              className="text-xs font-normal"
              size="sm"
              variant="secondary"
            >
              Add Task
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <AddTaskForm />
          <DrawerFooter className="my-0">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {children || (
          <Button
            className="text-xs font-normal"
            size="sm"
            variant="secondary"
          >
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[875px] max-h-[80vh] p-8 overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 bg-background rounded-xl">
        <AddTaskForm />
      </DialogContent>
    </Dialog>
  );
}
