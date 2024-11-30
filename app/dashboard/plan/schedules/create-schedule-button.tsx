"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import CreateScheduleForm from "./create-schedule-form";

export default function CreateScheduleButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-8 gap-1"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          New Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
        </DialogHeader>
        <CreateScheduleForm />
      </DialogContent>
    </Dialog>
  );
}
