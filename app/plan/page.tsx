"use client";

import { api } from "@/convex/_generated/api";
import { addActivity } from "./actions";
import ScheduleTable from "./schedule-table";
import { getFormattedDate } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import CreateScheduleButton from "./create-schedule-button";
import { Button } from "@/components/ui/button";

export default function PlanPage() {
  const todaySchedule = useQuery(api.schedules.getByDate, {
    date: getFormattedDate(new Date()),
  });
  const activities = useQuery(
    api.activities.listBySchedule,
    todaySchedule ? { scheduleId: todaySchedule._id } : "skip",
  );

  return (
    <main className="w-full flex flex-1 flex-col gap-4 p-2 lg:p-4">
      <div className="flex items-center mb-2">
        <h1 className="text-lg font-semibold md:text-2xl">Plan</h1>
      </div>

      {todaySchedule === undefined && <p>Loading...</p>}

      {todaySchedule === null && (
        <div className="min-h-screen flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No schedule for today
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a new schedule from scratch or with a template.
            </p>
            <CreateScheduleButton />
          </div>
        </div>
      )}

      {todaySchedule && activities && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Date: {todaySchedule.date} {todaySchedule.length} <span>hours</span>
          </h2>
          <ScheduleTable activities={activities} />
          <Button
            onClick={() => addActivity(todaySchedule._id)}
            className=""
          >
            Add new activity
          </Button>
        </div>
      )}
    </main>
  );
}
