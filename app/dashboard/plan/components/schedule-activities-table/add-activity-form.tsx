"use client";

import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function AddActivityForm({
  scheduleId,
  onActivityAdded,
}: {
  scheduleId: string;
  onActivityAdded: () => void;
}) {
  const create = useMutation(api.activities.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const activityData = {
      name: formData.get("activityName") as string,
      length: Number(formData.get("activityLength")),
    };
    await create({
      name: activityData.name,
      length: activityData.length,
      scheduleId: scheduleId as Id<"schedules">,
    });
    onActivityAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4 mb-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="activityName">Name</Label>
          <Input
            id="activityName"
            name="activityName"
            type="text"
            className="col-span-3"
            defaultValue={"New Activity"}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="activityStart">Start</Label>
          <Input
            id="activityStart"
            name="activityStart"
            type="number"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="activityLength">Length</Label>
          <Input
            id="activityLength"
            name="activityLength"
            type="number"
            className="col-span-3"
            defaultValue={25}
          />
        </div>
      </div>
      <Button
        className="float-right"
        type="submit"
      >
        Add activity
      </Button>
    </form>
  );
}
