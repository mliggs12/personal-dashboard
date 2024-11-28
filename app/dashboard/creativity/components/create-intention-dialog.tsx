import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CreateIntentionForm from "./create-intention-form";

export default function CreateIntentionDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className="h-10 gap-1 text-base"
          size="lg"
        >
          <PlusCircleIcon className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New Intention
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Intention</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <CreateIntentionForm
            onIntentionCreated={() => {
              setIsOpen(false);
            }}
          />
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
