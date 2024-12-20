"use server";

import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function deleteSchedule(scheduleId: Id<"schedules">) {
  try {
    await fetchMutation(api.schedules.deleteSchedule, { scheduleId });
    console.log("Schedule deleted successfully");
  } catch (error) {
    console.error("Error deleting the schedule:", error);
  }
}
