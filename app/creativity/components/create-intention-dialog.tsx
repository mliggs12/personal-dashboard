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
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";

export default function CreateIntentionDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className="h-8 gap-1"
          size="sm"
        >
          <PlusCircleIcon className="w-3.5 h-3.5" />
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
