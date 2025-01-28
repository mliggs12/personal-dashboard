"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { api } from "@/convex/_generated/api";

import AddActivityButton from "./components/schedule-activities-table/add-activity-button";
import ScheduleActivitiesTable from "./components/schedule-activities-table/schedule-activities-table";
import { TemplateSelect } from "./components/template-select";
import CreateScheduleButton from "./schedules/create-schedule-button";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function PlanDashboard() {
  const todaySchedule = useQuery(api.schedules.todaySchedule, {
    timezone: dayjs.tz.guess(),
  });

  const activities = useQuery(
    api.activities.listBySchedule,
    todaySchedule ? { scheduleId: todaySchedule._id } : "skip",
  );

  if (todaySchedule === undefined || activities === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg md:text-2xl font-semibold">Plan</h1>
      </div>

      {todaySchedule === null && (
        <div className="min-h-[calc(100vh_-_175px)] flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
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
          <TemplateSelect />
          <h2 className="text-lg font-semibold">
            Date: {todaySchedule.date} {todaySchedule.length} <span>hours</span>
          </h2>
          <ScheduleActivitiesTable activities={activities} />
          <AddActivityButton scheduleId={todaySchedule._id} />
        </div>
      )}
    </div>
  );
}
