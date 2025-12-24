"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type DeleteScope = "this" | "thisAndFollowing" | "all";

interface DeleteRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: DeleteScope) => void;
}

export default function DeleteRecurringTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteRecurringTaskDialogProps) {
  const [selectedScope, setSelectedScope] = useState<DeleteScope>("this");

  const handleConfirm = () => {
    onConfirm(selectedScope);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete recurring task</DialogTitle>
        <DialogDescription>
          Choose how you want to delete this recurring task instance.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <RadioGroup
          value={selectedScope}
          onValueChange={(value) => setSelectedScope(value as DeleteScope)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="this" id="this" />
            <Label
              htmlFor="this"
              className="flex-1 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This event
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem
              value="thisAndFollowing"
              id="thisAndFollowing"
            />
            <Label
              htmlFor="thisAndFollowing"
              className="flex-1 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This and following events
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="all" id="all" />
            <Label
              htmlFor="all"
              className="flex-1 cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All events
            </Label>
          </div>
        </RadioGroup>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Delete
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

