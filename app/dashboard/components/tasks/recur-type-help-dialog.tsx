"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecurTypeHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurTypeHelpDialog({
  open,
  onOpenChange,
}: RecurTypeHelpDialogProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">By schedule dates</p>
            <p className="text-sm text-muted-foreground">
              Repeat according to the regular repetition rules you set up in advance
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">By completion dates</p>
            <p className="text-sm text-muted-foreground">
              The next task recurrence will be generated only after the current task has been completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle>About Recur Type</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">{content}</div>
          <div className="p-4 border-t flex justify-end">
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="text-primary">GOT IT</Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md pb-3">
        <DialogHeader>
          <DialogTitle>About Recur Type</DialogTitle>
        </DialogHeader>
        <div>{content}</div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="text-primary">GOT IT</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

