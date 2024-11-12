"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddActivityForm } from "./add-activity-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function AddActivityButton({
  scheduleId,
}: {
  scheduleId: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleActivityAdded = () => {
    setOpen(false);
    toast({
      title: "Activity added",
      description: "The activity has been added successfully.",
      duration: 5000,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <AddActivityForm
            scheduleId={scheduleId}
            onActivityAdded={handleActivityAdded}
          />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
