import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import dayjs from "./lib/dayjs.config";
import { calculateNextRunDate } from "./recurringTasksHelpers";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

export const get = query({
  args: { recurringTaskId: v.optional(v.id("recurringTasks")) },
  async handler(ctx, { recurringTaskId }) {
    if (recurringTaskId) {
      return await ctx.db.get(recurringTaskId);
    }
    return;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    schedule: v.object({
      interval: v.object({
        amount: v.number(),
        unit: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
      }),
      time: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
      dayOfMonth: v.optional(v.number()),
    }),
    recurrenceType: v.union(v.literal("schedule"), v.literal("completion")),
    userId: v.optional(v.string()),
  },
  async handler(ctx, { name, schedule, recurrenceType, userId }) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }
    
    // Use the target user's timezone (not the current user's)
    const timezone = user!.timezone ?? "America/Denver";
    
    // Log timezone context
    const serverTimeUTC = dayjs().utc();
    const serverTimeLocal = dayjs();
    const userTimeLocal = dayjs().tz(timezone);
    
    console.log(`[recurringTasks.create] Creating new recurring task`);
    console.log(`  Task name: "${name}"`);
    console.log(`  Recurrence type: ${recurrenceType}`);
    console.log(`  Schedule: ${schedule.interval.amount} ${schedule.interval.unit}(s)`);
    console.log(`  Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
    console.log(`  Server time (local): ${serverTimeLocal.format("YYYY-MM-DD HH:mm:ss")} ${serverTimeLocal.format("z")}`);
    console.log(`  User timezone: ${timezone}`);
    console.log(`  User local time: ${userTimeLocal.format("YYYY-MM-DD HH:mm:ss")} (${userTimeLocal.format("dddd")})`);
    
    const baseDate = dayjs().tz(timezone).startOf("day");
    const nextRunDate = calculateNextRunDate(schedule, baseDate);
    
    console.log(`  Base date (today in ${timezone}): ${baseDate.format("YYYY-MM-DD")}`);
    console.log(`  Calculated nextRunDate: ${nextRunDate}`);
    
    const taskId = await ctx.db.insert("recurringTasks", {
      name,
      schedule,
      recurrenceType,
      nextRunDate,
      isActive: true,
      updated: Date.now(),
      userId: user!._id,
    });

    console.log(`  ✅ Created recurring task with ID: ${taskId}\n`);

    return taskId;
  },
});

export const update = mutation({
  args: {
    recurringTaskId: v.id("recurringTasks"),
    name: v.optional(v.string()),
    schedule: v.optional(v.object({
      interval: v.optional(v.object({
        amount: v.optional(v.number()),
        unit: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
      })),
      time: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
      dayOfMonth: v.optional(v.number()),
    })),
    recurrenceType: v.optional(v.union(v.literal("schedule"), v.literal("completion"))),
    nextRunDate: v.optional(v.string()),
  },
  async handler(
    ctx,
    { recurringTaskId, name, schedule, recurrenceType, nextRunDate },
  ) {
    const recurringTask = await ctx.db.get(recurringTaskId);
    if (!recurringTask) {
      throw new Error("Recurring task not found");
    }

    // Merge schedule if provided (handle partial updates)
    let mergedSchedule = recurringTask.schedule;
    if (schedule) {
      // Merge interval properly - ensure both amount and unit are present
      let mergedInterval: { amount: number; unit: "day" | "week" | "month" } | undefined = recurringTask.schedule?.interval;
      if (schedule.interval) {
        const existingInterval = recurringTask.schedule?.interval;
        mergedInterval = {
          amount: schedule.interval.amount ?? existingInterval?.amount ?? 1,
          unit: schedule.interval.unit ?? existingInterval?.unit ?? "day",
        };
      }
      
      mergedSchedule = {
        interval: mergedInterval,
        time: schedule.time !== undefined ? schedule.time : recurringTask.schedule?.time,
        daysOfWeek: schedule.daysOfWeek !== undefined ? schedule.daysOfWeek : recurringTask.schedule?.daysOfWeek,
        dayOfMonth: schedule.dayOfMonth !== undefined ? schedule.dayOfMonth : recurringTask.schedule?.dayOfMonth,
      };
    }

    // Recalculate nextRunDate if schedule changed and has valid interval
    let calculatedNextRunDate = nextRunDate;
    if (schedule && mergedSchedule?.interval) {
      const user = await ctx.db.get(recurringTask.userId);
      const timezone = user?.timezone ?? "America/Denver";
      
      // Log timezone context
      const serverTimeUTC = dayjs().utc();
      const serverTimeLocal = dayjs();
      
      console.log(`[recurringTasks.update] Recalculating nextRunDate`);
      console.log(`  Task: "${recurringTask.name}" (ID: ${recurringTaskId})`);
      console.log(`  Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
      console.log(`  Server time (local): ${serverTimeLocal.format("YYYY-MM-DD HH:mm:ss")} ${serverTimeLocal.format("z")}`);
      console.log(`  User timezone: ${timezone}`);
      console.log(`  Previous nextRunDate: ${recurringTask.nextRunDate}`);
      console.log(`  New schedule: ${mergedSchedule.interval.amount} ${mergedSchedule.interval.unit}(s)`);
      
      // Parse date strings directly in the target timezone to avoid date shifts
      // Using dayjs.tz(dateString, timezone) instead of dayjs(dateString).tz(timezone)
      // ensures the date is interpreted as midnight in the target timezone, not server timezone
      const baseDate = nextRunDate 
        ? dayjs.tz(nextRunDate, timezone).startOf("day")
        : dayjs.tz(recurringTask.nextRunDate, timezone).startOf("day");
      
      console.log(`  Base date (parsed in ${timezone}): ${baseDate.format("YYYY-MM-DD")} (${baseDate.format("dddd")})`);
      console.log(`  Using dayjs.tz() to parse directly in ${timezone} - avoids date shift from server timezone`);
      
      calculatedNextRunDate = calculateNextRunDate(
        {
          interval: mergedSchedule.interval,
          time: mergedSchedule.time,
          daysOfWeek: mergedSchedule.daysOfWeek,
          dayOfMonth: mergedSchedule.dayOfMonth,
        },
        baseDate
      );
      
      console.log(`  Calculated new nextRunDate: ${calculatedNextRunDate}\n`);
    }

    await ctx.db.patch(recurringTaskId, {
      name: name !== undefined ? name : recurringTask.name,
      schedule: mergedSchedule,
      recurrenceType: recurrenceType !== undefined ? recurrenceType : recurringTask.recurrenceType,
      nextRunDate: calculatedNextRunDate !== undefined ? calculatedNextRunDate : recurringTask.nextRunDate,
      updated: Date.now(),
    });
  },
});

export const recurringTasksWithStats = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const recurringTasks = await ctx.db
      .query("recurringTasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const recurringTasksWithStats = await Promise.all(
      recurringTasks.map(async (recurringTask) => {
        const instances = await ctx.db
          .query("tasks")
          .withIndex("by_recurringTaskId", (q) =>
            q.eq("recurringTaskId", recurringTask._id),
          )
          .order("desc")
          .collect();

        const count = instances.length ?? 0;
        const lastRecurrence = instances.length > 0 ? instances[0]._creationTime : undefined;

        return {
          ...recurringTask,
          stats: {
            count,
            lastRecurrence,
          },
        };
      }),
    );

    return recurringTasksWithStats;
  },
});

// export const removePriorityFromAll = mutation({
//   async handler(ctx) {
//     // Get all recurringTasks
//     const allRecurringTasks = await ctx.db.query("recurringTasks").collect();

//     // Filter to only those that have priority set
//     const tasksWithPriority = allRecurringTasks.filter(
//       (task) => task.priority !== undefined,
//     );

//     // Remove priority from each task
//     let updatedCount = 0;
//     for (const task of tasksWithPriority) {
//       await ctx.db.patch(task._id, {
//         priority: undefined,
//         updated: Date.now(),
//       });
//       updatedCount++;
//     }

//     return {
//       totalTasks: allRecurringTasks.length,
//       tasksWithPriority: tasksWithPriority.length,
//       updatedCount,
//     };
//   },
// });