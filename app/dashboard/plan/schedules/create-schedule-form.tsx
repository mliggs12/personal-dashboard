"use client";

import dayjs from "dayjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createNewSchedule } from "../actions";


export default function CreateScheduleForm() {
  const [isTemplate, setIsTemplate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const scheduleName = formData.get("scheduleName") as string;
    const scheduleDate = formData.get("scheduleDate") as string;

    await createNewSchedule(scheduleName, scheduleDate, isTemplate);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsTemplate(checked);
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
            autoComplete="off"
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
            defaultValue={dayjs().format("YYYY/MM/DD")}
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label
            id="isTemplate"
            className="text-right"
          >
            Template?
          </Label>
          <Checkbox
            id="isTemplate"
            name="isTemplate"
            checked={isTemplate}
            onCheckedChange={handleCheckboxChange}
            className="col-span-3"
          />
        </div>
      </div>
      <Button type="submit">Create Schedule</Button>
    </form>
  );
}
