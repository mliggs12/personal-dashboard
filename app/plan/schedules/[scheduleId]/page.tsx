"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { addActivity } from "../../actions";
import ScheduleProvider from "../../components/schedule-context";
import ScheduleTable from "../../components/schedule-table";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import ScheduleManager from "../../components/schedule-manager";

export default function SchedulePage() {
  const { scheduleId } = useParams<{ scheduleId: Id<"schedules"> }>();
  const schedule = useQuery(api.schedules.get, {
    scheduleId: scheduleId,
  });

  const activities = useQuery(api.activities.listBySchedule, {
    scheduleId: scheduleId,
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg md:text-2xl font-semibold">Plan</h1>
      </div>

      {schedule === undefined && <p>Loading...</p>}

      {schedule && activities === null && (
        <div className="min-h-[calc(100vh_-_175px)] flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No activities for this schedule
            </h3>
            <p className="text-sm text-muted-foreground">
              Add an activity to the schedule.
            </p>
            <Button
              onClick={() => addActivity(schedule._id)}
              className=""
            >
              Add new activity
            </Button>
          </div>
        </div>
      )}

      {schedule && activities && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Name: {schedule.name} Date: {schedule.date} {schedule.length}{" "}
            <span>hours</span>
          </h2>
          <ScheduleProvider>
            <ScheduleManager scheduleId={scheduleId} />
            <ScheduleTable />
          </ScheduleProvider>
          <Button
            onClick={() => addActivity(schedule._id)}
            className=""
          >
            Add new activity
          </Button>
        </div>
      )}
    </div>
  );
}
