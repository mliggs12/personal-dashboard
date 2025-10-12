"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import dayjs from "dayjs";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { ActivitiesDataTable } from "./components/activities-data-table";
import LayoutTable from "./components/layout-table";

export default function PlanDashboard() {
  const [schedule, setSchedule] = useState<Doc<"schedules"> | null>(null);

  const todaySchedule = useMutation(api.schedules.getOrCreateByDate);

  useEffect(() => {
    if (!schedule) {
      todaySchedule({ date: dayjs().format("YYYY-MM-DD") }).then((result) => setSchedule(result));
    }
  }, [todaySchedule, schedule]);

  return (
    <section className="h-full flex flex-col">
      <div className="header flex flex-col px-1">
        <h1 className="text-lg md:text-2xl font-semibold">
          {dayjs().format("dddd, MMMM D")}
        </h1>
        <div className="text-sm">
          {schedule?.length ?? 16.5} hours
        </div>
      </div>
      <div className="h-full flex flex-col">
        {schedule ? (
          <ActivitiesDataTable scheduleId={schedule._id} />
        ) : (
          <LayoutTable />
        )}
      </div>
    </section>
  );
}
