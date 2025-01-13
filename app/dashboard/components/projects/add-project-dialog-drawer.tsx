import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

import { AddProjectForm } from "./add-project-form";

export default function AddProjectDialogDrawer() {
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
          >
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <AddProjectForm />
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
        <Button
          size="icon"
          variant="secondary"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[875px] max-h-[80vh] p-8 overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 bg-background rounded-xl">
        <AddProjectForm />
      </DialogContent>
    </Dialog>
  );
}
