import { useState } from "react";
import { CirclePlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";

import { CreateTemplateForm } from "./create-template-form";

export default function CreateTemplateDrawerDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Create template</DrawerTitle>
          </DrawerHeader>
          <CreateTemplateForm className="px-4" />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
        >
          <CirclePlus /><span>Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[875px] max-h-[80vh] p-8 overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 bg-background rounded-xl">
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
        </DialogHeader>
        <CreateTemplateForm />
      </DialogContent>
    </Dialog>
  );
}
