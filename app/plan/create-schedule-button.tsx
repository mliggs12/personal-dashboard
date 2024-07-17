"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateScheduleForm } from "./create-schedule-form";
import { createSchedule } from "./actions";

export default function CreateScheduleButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Schedule</Button>
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
