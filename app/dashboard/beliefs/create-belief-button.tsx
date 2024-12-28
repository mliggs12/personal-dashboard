"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
        <Button
          size="sm"
          className="flex items-center gap-2"
        >
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
                duration: 3000,
              });
            }}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
