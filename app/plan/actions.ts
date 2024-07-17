"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";

export async function createSchedule(
  name?: string,
  date?: string,
  isTemplate?: boolean,
  length?: number,
) {
  if (!name) {
    name = "noname";
  }
  // If no length is provided, default to 17.75
  if (!length) {
    length = 17.75;
  }
  // If isTemplate is not provided, default to false
  if (!isTemplate) {
    isTemplate = false;
  }
  const scheduleId = await fetchMutation(api.schedules.createSchedule, {
    name: name,
    date: date,
    isTemplate: isTemplate,
    length: length,
  });
  console.log(
    `Created schedule '${name}' with ID: ${scheduleId}. Creating a new activity.`,
  );

  // Create a new activity for the schedule
  await createActivity(scheduleId);
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

// Currently if there are no activities for the schedule, a new activity is created
// export async function getScheduleActivities(scheduleId: Id<"schedules">) {
//   let activities = await fetchQuery(api.activities.listBySchedule, {
//     scheduleId,
//   });
//   if (activities === undefined) {
//     console.log("The query returned undefined");
//   } else if (activities.length === 0) {
//     console.log(
//       "The query was successful, but no activities were found. Creating a new activity.",
//     );
//     const newActivityId = await addActivity(scheduleId);
//     console.log(
//       `Created activity with id: ${newActivityId}. Fetching activities again.`,
//     );
//     await addActivity(newActivityId);
//     return activities;
//   }
// }

// export async function preloadTodayScheduleActivities() {
//   try {
//     const todayScheduleId: Id<"schedules"> = getTodaySchedule();
//   }
//   console.log(`Preloading schedule and activities for Today`);
//   const preloadedActivities = await preloadQuery(api.activities.listBySchedule, { scheduleId: todayScheduleId });
// }

export async function createActivity(
  scheduleId: Id<"schedules">,
  name?: string,
) {
  if (!name) {
    name = "-";
  }
  const activityId = await fetchMutation(api.activities.addActivity, {
    scheduleId,
    name,
  });
  console.log(
    `Created activity '${name}' with id: ${activityId} for schedule ${scheduleId}`,
  );
  return activityId;
}
