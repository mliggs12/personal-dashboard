"use client";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateBeliefForm from "./create-belief-form";

export default function CreateBeliefButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Dialog
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Create Belief
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Belief</DialogTitle>
          <DialogDescription>
            Type a title you want to be searchable later on.
          </DialogDescription>

          <CreateBeliefForm
            onBeliefCreated={() => {
              setIsOpen(false);
              toast({
                title: "Belief created",
                description: "Your belief has been created successfully",
              });
            }}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
