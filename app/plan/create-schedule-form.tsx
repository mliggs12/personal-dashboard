"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFormattedDate } from "@/lib/utils";
import { createSchedule } from "./actions";

export function CreateScheduleForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const scheduleName = formData.get("scheduleName") as string;
    const scheduleDate = formData.get("scheduleDate") as string;
    await createSchedule(scheduleName, scheduleDate);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            htmlFor="scheduleName"
            className="text-right"
          >
            Name
          </Label>
          <Input
            id="scheduleName"
            name="scheduleName"
            type="text"
            className="col-span-3"
            defaultValue={"noname"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            id="scheduleDate"
            className="text-right"
          >
            Date
          </Label>
          <Input
            id="scheduleDate"
            name="scheduleDate"
            type="text"
            className="col-span-3"
            defaultValue={getFormattedDate(new Date())}
          />
        </div>
      </div>
      <Button type="submit">Create Schedule</Button>
    </form>
  );
}
