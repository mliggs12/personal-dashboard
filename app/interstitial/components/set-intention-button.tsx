import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import SetIntentionForm from "./set-intention-form";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function SetIntentionButton({
  onIntentionSet,
}: {
  onIntentionSet: (
    intentionId: Id<"intentions">,
    title: string,
    why: string,
    time: number,
  ) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

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
        <SetIntentionForm
          onIntentionSet={(intentionId, title, why, time) => {
            setIsOpen(false);
            onIntentionSet(intentionId, title, why, time);
            toast({
              title: "Intention set",
              description: `${title} - ${time} seconds`,
            });
          }}
        />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
