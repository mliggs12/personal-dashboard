"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";

export async function createNewSchedule(
  name?: string,
  date?: string,
  isTemplate?: boolean,
  length?: number,
  start?: number,
) {
  if (!name) {
    name = "";
  }
  // If no length is provided, default to 17.75
  if (!length) {
    length = 17.75;
  }
  // If isTemplate is not provided, default to false
  if (!isTemplate) {
    isTemplate = false;
  }
  if (!start) {
    start = 420;
  }
  const scheduleId = await fetchMutation(api.schedules.createSchedule, {
    name: name,
    date: date,
    isTemplate: isTemplate,
    length: length,
  });
  console.log(
    `Created schedule '${name}' with ID: ${scheduleId}. Creating a new activity...`,
  );

  // Create a new activity for the schedule
  await addActivity(scheduleId, (start = start));
}

// Retrieves the id of the schedule for today, creating a new schedule if it doesn't exist
export async function getScheduleByDate(date: string) {
  const schedule = await fetchQuery(api.schedules.getByDate, {
    date: date,
  });
  if (schedule === undefined) {
    console.log("The query returned undefined");
  } else if (schedule === null) {
    console.log("The query was successful, but no schedule was found.");
  } else {
    console.log(
      `The query was successful, and the schedule was found. The schedule id is: ${schedule._id}`,
    );
  }
  return schedule;
}

export async function addActivity(scheduleId: Id<"schedules">, start?: number) {
  const activityId = await fetchMutation(api.activities.createActivity, {
    scheduleId,
    start: start,
    name: "-",
  });
  console.log(
    `Created activity with ID ${activityId} for schedule ${scheduleId}`,
  );
}
