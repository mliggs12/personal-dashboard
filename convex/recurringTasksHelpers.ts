import { Dayjs } from "dayjs";

import { Doc } from "./_generated/dataModel";
import { internalMutation,MutationCtx } from "./_generated/server";
import dayjs from "./lib/dayjs.config";

export function calculateNextRunDate(
  schedule: {
    interval: {
      amount: number;
      unit: "day" | "week" | "month";
    };
    time?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  },
  baseDate: dayjs.Dayjs
): string {
  switch (schedule.interval.unit) {
    case "day":
      return baseDate.add(schedule.interval.amount, "day").format("YYYY-MM-DD");
    case "week":
      return baseDate.add(schedule.interval.amount, "week").format("YYYY-MM-DD");
    case "month":
      return baseDate.add(schedule.interval.amount, "month").format("YYYY-MM-DD");
    default:
      throw new Error(`Invalid unit: ${schedule.interval?.unit}`);
  }
}

/**
 * Determines if an "onSchedule" recurring task should generate a task today.
 * recurringTask.nextRunDate represents the NEXT run date that should be generated.
 * 
 * For onSchedule tasks, we generate based purely on schedule/frequency,
 * regardless of whether previous instances were completed.
 */
export function checkIfShouldGenerate(
    recurringTask: {
      schedule?: {
        interval: {
          amount: number;
          unit: "day" | "week" | "month";
        };
        time?: string;
        daysOfWeek?: number[];
        dayOfMonth?: number;
      };
      nextRunDate: string;
    },
    targetDate: Dayjs,
    timezone: string
  ): boolean {
    if (!recurringTask.nextRunDate) {
      console.log(`[checkIfShouldGenerate] Skipping: nextRunDate is missing`);
      return false;
    }
    
    // Parse the date string directly in the target timezone to avoid date shifts
    // Using dayjs.tz(dateString, timezone) instead of dayjs(dateString).tz(timezone)
    // ensures the date is interpreted as midnight in the target timezone, not server timezone
    const nextRunDate = dayjs.tz(recurringTask.nextRunDate, timezone).startOf("day");
    const todayStart = targetDate.startOf("day");
    
    // Log timezone context for debugging
    const serverTimeUTC = dayjs().utc();
    const serverTimeLocal = dayjs();
    
    console.log(`[checkIfShouldGenerate] Checking if task should generate`);
    console.log(`  Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
    console.log(`  Server time (local): ${serverTimeLocal.format("YYYY-MM-DD HH:mm:ss")} ${serverTimeLocal.format("z")}`);
    console.log(`  User timezone: ${timezone}`);
    console.log(`  Today in user timezone: ${todayStart.format("YYYY-MM-DD")} (${todayStart.format("dddd")})`);
    console.log(`  Next run date (stored): ${recurringTask.nextRunDate}`);
    console.log(`  Next run date (parsed in ${timezone}): ${nextRunDate.format("YYYY-MM-DD")} (${nextRunDate.format("dddd")})`);
    console.log(`  Schedule: ${recurringTask.schedule?.interval?.amount || 'N/A'} ${recurringTask.schedule?.interval?.unit || 'N/A'}`);
    
    // Don't generate if today is before the next due date
    if (todayStart.isBefore(nextRunDate)) {
      console.log(`  ❌ SKIP: Today (${todayStart.format("YYYY-MM-DD")}) is before next run date (${nextRunDate.format("YYYY-MM-DD")})`);
      return false;
    }
    
    // For weekly/monthly, also require matching day/date pattern
    // For daily: nextRunDate is already calculated correctly, so if today >= nextRunDate, generate
    if (!recurringTask.schedule?.interval) {
      console.log(`  ❌ SKIP: Schedule interval is missing`);
      return false;
    }
    
    switch (recurringTask.schedule.interval.unit) {
      case "day":
        console.log(`  ✅ GENERATE: Daily task - today (${todayStart.format("YYYY-MM-DD")}) >= next run date (${nextRunDate.format("YYYY-MM-DD")})`);
        return true; // Generate if today >= nextRunDate (already checked above)
      case "week":
      case "month":
        const shouldGenerate = todayStart.isSame(nextRunDate, "day");
        if (shouldGenerate) {
          console.log(`  ✅ GENERATE: ${recurringTask.schedule.interval.unit}ly task - today matches next run date exactly`);
        } else {
          console.log(`  ❌ SKIP: ${recurringTask.schedule.interval.unit}ly task - today (${todayStart.format("YYYY-MM-DD")}) does not match next run date (${nextRunDate.format("YYYY-MM-DD")})`);
        }
        return shouldGenerate;
      default:
        console.log(`  ❌ SKIP: Unknown interval unit: ${recurringTask.schedule.interval.unit}`);
        return false;
    }
  }
  
  /**
   * Creates the next task instance for a "whenDone" recurring task.
   * Called immediately when a task is completed.
   */
  export async function createNextWhenDoneTask(
    ctx: MutationCtx,
    completedTask: Doc<"tasks">,
    recurringTask: Doc<"recurringTasks">
  ): Promise<void> {
    // Get the recurring task owner's timezone (not the current user's)
    const user = await ctx.db.get(recurringTask.userId);
    const timezone = user?.timezone ?? "America/Denver";
    const today = dayjs().tz(timezone).startOf("day");
    
    // Log timezone context
    const serverTimeUTC = dayjs().utc();
    const serverTimeLocal = dayjs();
    
    console.log(`[createNextWhenDoneTask] Creating next task for "whenDone" recurring task`);
    console.log(`  Task name: "${recurringTask.name}"`);
    console.log(`  Completed task ID: ${completedTask._id}`);
    console.log(`  Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
    console.log(`  Server time (local): ${serverTimeLocal.format("YYYY-MM-DD HH:mm:ss")} ${serverTimeLocal.format("z")}`);
    console.log(`  User timezone: ${timezone}`);
    console.log(`  Today in user timezone: ${today.format("YYYY-MM-DD")} (${today.format("dddd")})`);
    
    if (!recurringTask.schedule?.interval) {
      throw new Error("Recurring task schedule is missing");
    }
    
    // Calculate next due date using schedule interval amount
    const nextDueDate = calculateNextRunDate(
      {
        interval: recurringTask.schedule.interval,
        time: recurringTask.schedule.time,
        daysOfWeek: recurringTask.schedule.daysOfWeek,
        dayOfMonth: recurringTask.schedule.dayOfMonth,
      },
      today
    );
    
    console.log(`  Schedule: ${recurringTask.schedule.interval.amount} ${recurringTask.schedule.interval.unit}(s)`);
    console.log(`  Calculated next due date: ${nextDueDate}`);
    
    // Prevent duplicates: check if task already exists with this due date
    const existingTask = await ctx.db
      .query("tasks")
      .withIndex("by_recurringTaskId", (q) =>
        q.eq("recurringTaskId", recurringTask._id)
      )
      .filter((q) => q.eq(q.field("due"), nextDueDate))
      .first();
    
    if (existingTask) {
      // Task already exists, just update nextRunDate if needed
      console.log(`  ⚠️  Task with due date ${nextDueDate} already exists (ID: ${existingTask._id}), updating nextRunDate only`);
      await ctx.db.patch(recurringTask._id, {
        nextRunDate: nextDueDate,
        updated: Date.now(),
      });
      return;
    }
    
    const newTaskId = await ctx.db.insert("tasks", {
      name: recurringTask.name,
      status: "todo",
      priority: "normal",
      notes: completedTask.notes || "",
      due: nextDueDate,
      recurringTaskId: recurringTask._id,
      userId: recurringTask.userId,
    });
    
    await ctx.db.patch(recurringTask._id, {
      nextRunDate: nextDueDate,
      updated: Date.now(),
    });
    
    console.log(`  ✅ Created new task instance`);
    console.log(`    New task ID: ${newTaskId}`);
    console.log(`    Due date: ${nextDueDate}`);
    console.log(`    Updated recurring task nextRunDate to: ${nextDueDate}`);
  }
  
  /**
   * Internal mutation: Generates recurring task instances for "onSchedule" type tasks.
   * Runs via cron job hourly, but only executes at 6am local time.
   * 
   * onSchedule tasks generate based purely on schedule/frequency, regardless of
   * whether previous instances were completed. Duplicate prevention ensures we
   * don't create multiple tasks with the same due date.
   */
  export const generateRecurringTasks = internalMutation({
    async handler(ctx) {
      // Log cron job start with timezone context
      const serverTimeUTC = dayjs().utc();
      const serverTimeLocal = dayjs();
      
      console.log(`\n${"=".repeat(80)}`);
      console.log(`[generateRecurringTasks] Cron job started`);
      console.log(`  Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
      console.log(`  Server time (local): ${serverTimeLocal.format("YYYY-MM-DD HH:mm:ss")} ${serverTimeLocal.format("z")}`);
      console.log(`  NOTE: In production (Vercel/Convex), server runs in UTC. Local testing may differ.`);
      console.log(`${"=".repeat(80)}\n`);
      
      // Use composite index for better performance
      const recurringTasks = await ctx.db
        .query("recurringTasks")
        .withIndex("by_isActive_recurrenceType", (q) =>
          q.eq("isActive", true).eq("recurrenceType", "schedule")
        )
        .collect();

      console.log(`[generateRecurringTasks] Found ${recurringTasks.length} active "schedule" type recurring tasks\n`);

      let generatedCount = 0;
      let errorCount = 0;
      const skippedByTimezone: Record<string, number> = {};
      const skippedBySchedule: Record<string, number> = {};
      const skippedByDuplicate: Record<string, number> = {};
      const errors: Array<{ taskId: string; error: string }> = [];

      for (const recurringTask of recurringTasks) {
        try {
          // Skip if schedule is missing
          if (!recurringTask.schedule?.interval) {
            console.log(`[generateRecurringTasks] ⚠️  Skipping "${recurringTask.name}" (ID: ${recurringTask._id}): Schedule interval missing`);
            continue;
          }
          
          // Get user's timezone
          const user = await ctx.db.get(recurringTask.userId);
          if (!user) {
            console.log(`[generateRecurringTasks] ⚠️  Skipping "${recurringTask.name}" (ID: ${recurringTask._id}): User not found`);
            continue;
          }
          const timezone = user.timezone ?? "America/Denver";
          
          const localNow = dayjs().tz(timezone);
          const localHour = localNow.hour();
          const localMinute = localNow.minute();
          
          console.log(`\n[generateRecurringTasks] Processing: "${recurringTask.name}" (ID: ${recurringTask._id})`);
          console.log(`  User timezone: ${timezone}`);
          console.log(`  Local time in ${timezone}: ${localNow.format("YYYY-MM-DD HH:mm:ss")} (${localNow.format("dddd")})`);
          console.log(`  Local hour: ${localHour}, minute: ${localMinute}`);
          
          // Only run at 6am local time for this user's timezone (with 10 minute window)
          if (localHour !== 6 || localMinute >= 10) {
            const reason = localHour !== 6 
              ? `not 6am (current hour: ${localHour})`
              : `past 10-minute window (current minute: ${localMinute})`;
            console.log(`  ⏭️  SKIP: ${reason} - waiting for 6:00-6:09 local time`);
            skippedByTimezone[timezone] = (skippedByTimezone[timezone] || 0) + 1;
            continue;
          }
          
          console.log(`  ✅ Time check passed: Within 6:00-6:09 window in ${timezone}`);
          
          const todayLocal = localNow.startOf("day");
          
          // Use nextRunDate directly
          if (!recurringTask.nextRunDate) {
            console.log(`  ⚠️  SKIP: nextRunDate is missing`);
            continue;
          }
          
          // Type guard: we already checked schedule.interval exists above
          const schedule = recurringTask.schedule!;
          const interval = schedule.interval!;
          
          console.log(`  Schedule: ${interval.amount} ${interval.unit}(s)`);
          console.log(`  Stored nextRunDate: ${recurringTask.nextRunDate}`);
          
          // Check if we should generate based on schedule
          const shouldGenerate = checkIfShouldGenerate(
            {
              schedule: {
                interval: interval,
                time: schedule.time,
                daysOfWeek: schedule.daysOfWeek,
                dayOfMonth: schedule.dayOfMonth,
              },
              nextRunDate: recurringTask.nextRunDate,
            },
            todayLocal,
            timezone
          );
          
          if (!shouldGenerate) {
            skippedBySchedule[recurringTask.name] = (skippedBySchedule[recurringTask.name] || 0) + 1;
            continue;
          }
          
          // Use today's date as the task's due date (we're generating today)
          // This avoids timezone conversion issues when parsing nextRunDate string
          const taskDueDate = todayLocal.format("YYYY-MM-DD");
          console.log(`  Task due date (using todayLocal): ${taskDueDate}`);
          
          // Prevent duplicates: check if task already exists with this due date
          const existingTask = await ctx.db
            .query("tasks")
            .withIndex("by_recurringTaskId", (q) =>
              q.eq("recurringTaskId", recurringTask._id)
            )
            .filter((q) => q.eq(q.field("due"), taskDueDate))
            .first();
          
          if (existingTask) {
            console.log(`  ⚠️  SKIP: Task with due date ${taskDueDate} already exists (ID: ${existingTask._id})`);
            skippedByDuplicate[recurringTask.name] = (skippedByDuplicate[recurringTask.name] || 0) + 1;
            continue;
          }
          
          // Create the new task instance
          const newTaskId = await ctx.db.insert("tasks", {
            name: recurringTask.name,
            status: "todo",
            notes: "",
            due: taskDueDate,
            recurringTaskId: recurringTask._id,
            userId: recurringTask.userId,
          });
          
          // Update recurring task's next run date
          const nextRunDate = calculateNextRunDate(
            {
              interval: recurringTask.schedule.interval,
              time: recurringTask.schedule.time,
              daysOfWeek: recurringTask.schedule.daysOfWeek,
              dayOfMonth: recurringTask.schedule.dayOfMonth,
            },
            todayLocal
          );
          
          await ctx.db.patch(recurringTask._id, {
            nextRunDate: nextRunDate,
            updated: Date.now(),
          });
          
          console.log(`  ✅ SUCCESS: Created task instance`);
          console.log(`    New task ID: ${newTaskId}`);
          console.log(`    Due date: ${taskDueDate}`);
          console.log(`    Updated nextRunDate: ${recurringTask.nextRunDate} → ${nextRunDate}`);
          
          generatedCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            taskId: recurringTask._id,
            error: error instanceof Error ? error.message : String(error),
          });
          console.error(`[generateRecurringTasks] ❌ ERROR generating task for "${recurringTask.name}" (ID: ${recurringTask._id}):`, error);
        }
      }

      console.log(`\n${"=".repeat(80)}`);
      console.log(`[generateRecurringTasks] Cron job completed`);
      console.log(`  ✅ Generated: ${generatedCount} task instances`);
      console.log(`  ❌ Errors: ${errorCount}`);
      console.log(`  ⏭️  Skipped by timezone: ${JSON.stringify(skippedByTimezone)}`);
      console.log(`  ⏭️  Skipped by schedule check: ${Object.keys(skippedBySchedule).length} tasks`);
      console.log(`  ⏭️  Skipped by duplicate: ${Object.keys(skippedByDuplicate).length} tasks`);
      if (errors.length > 0) {
        console.error(`  Error details:`, errors);
      }
      console.log(`${"=".repeat(80)}\n`);
      
      return { generatedCount, errorCount, skipped: false };
    },
  });