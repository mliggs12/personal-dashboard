import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import SetIntentionForm from "./set-intention-form";

export default function SetIntentionButton({
  onIntentionSet,
}: {
  onIntentionSet: (what: string, why: string, time: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleIntentionSet = (what: string, why: string, time: number) => {
    setIsOpen(false);
    toast({
      title: "Intention set",
      description: `${what} - ${time} seconds`,
    });
    onIntentionSet(what, why, time);
  };

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2 text-base"
          size="lg"
        >
          <PlusCircleIcon className="w-3.5 h-3.5" />
          <span className="sr-only md:not-sr-only">Set intention</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set intention</DialogTitle>
        </DialogHeader>
        <SetIntentionForm onIntentionSet={handleIntentionSet} />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
