import { Dayjs } from "dayjs";

import { Doc } from "./_generated/dataModel";
import { internalMutation, MutationCtx } from "./_generated/server";
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
      // If daysOfWeek is specified, calculate the next occurrence based on selected days
      if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
        const currentDayOfWeek = baseDate.day(); // 0 = Sunday, 6 = Saturday
        const sortedDays = [...schedule.daysOfWeek].sort((a, b) => a - b);
        
        // Find the next day in the current week (must be > currentDayOfWeek)
        // This ensures we skip today even if today is one of the selected days
        const nextDayInWeek = sortedDays.find(day => day > currentDayOfWeek);
        
        if (nextDayInWeek !== undefined) {
          // Next day is in the current week
          const daysToAdd = nextDayInWeek - currentDayOfWeek;
          return baseDate.add(daysToAdd, "day").format("YYYY-MM-DD");
        } else {
          // No day found in current week, wrap to first day of next week
          // Calculate: days to end of week + days to first selected day
          const firstDay = sortedDays[0];
          const daysToEndOfWeek = 7 - currentDayOfWeek;
          const daysToAdd = daysToEndOfWeek + firstDay;
          
          // If interval amount > 1, add additional weeks
          const additionalWeeks = (schedule.interval.amount - 1) * 7;
          return baseDate.add(daysToAdd + additionalWeeks, "day").format("YYYY-MM-DD");
        }
      }
      // No daysOfWeek specified, use simple week addition
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
    if (!recurringTask.nextRunDate || !recurringTask.schedule?.interval) {
      return false;
    }
    
    // Parse the date string directly in the target timezone to avoid date shifts
    const nextRunDate = dayjs.tz(recurringTask.nextRunDate, timezone).startOf("day");
    const todayStart = targetDate.startOf("day");
    
    // Don't generate if today is before the next due date
    if (todayStart.isBefore(nextRunDate)) {
      return false;
    }
    
    const interval = recurringTask.schedule.interval;
    
    switch (interval.unit) {
      case "day":
        return true; // Generate if today >= nextRunDate (already checked above)
      case "week":
        // For weekly schedules with specific days, check if today is one of the selected days
        if (recurringTask.schedule?.daysOfWeek && recurringTask.schedule.daysOfWeek.length > 0) {
          const todayDayOfWeek = todayStart.day(); // 0 = Sunday, 6 = Saturday
          const isTodaySelected = recurringTask.schedule.daysOfWeek.includes(todayDayOfWeek);
          // Only generate if today is a selected day AND today >= nextRunDate
          return isTodaySelected && !todayStart.isBefore(nextRunDate);
        }
        // For weekly schedules without specific days, check if today matches nextRunDate
        return todayStart.isSame(nextRunDate, "day");
      case "month":
        return todayStart.isSame(nextRunDate, "day");
      default:
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
   * Core logic for generating recurring tasks.
   * @param dryRun - If true, performs all checks and logging but doesn't write to database
   * @param forceRun - If true, bypasses the 6am Mountain Time check
   */
  async function generateRecurringTasksCore(
    ctx: MutationCtx,
    dryRun: boolean = false,
    forceRun: boolean = false
  ) {
    // Check if it's 6am Mountain Time (America/Denver) - server runs in UTC
    // Mountain Time is UTC-6 (MST) or UTC-7 (MDT during daylight saving)
    const serverTimeUTC = dayjs().utc();
    const mountainTime = dayjs().tz("America/Denver");
    
    console.log(`[generateRecurringTasks] Server time (UTC): ${serverTimeUTC.format("YYYY-MM-DD HH:mm:ss")} UTC`);
    console.log(`[generateRecurringTasks] Mountain Time: ${mountainTime.format("YYYY-MM-DD HH:mm:ss")} ${mountainTime.format("z")}`);
    
    if (dryRun || forceRun) {
      console.log(`[generateRecurringTasks] ${dryRun ? "DRY RUN MODE" : "FORCE RUN MODE"} - ${dryRun ? "no database writes will be performed" : "bypassing 6am check"}`);
    }

    if (!forceRun && mountainTime.hour() !== 6) {
      console.log(`[generateRecurringTasks] Not 6am Mountain Time, skipping`);
      return { generatedCount: 0, errorCount: 0, skipped: true };
    }
    
    console.log(`[generateRecurringTasks] ${forceRun ? "Force running" : "6am Mountain Time"}, proceeding with task generation`);
    
    const recurringTasks = await ctx.db
      .query("recurringTasks")
      .withIndex("by_isActive_recurrenceType", (q) =>
        q.eq("isActive", true).eq("recurrenceType", "schedule")
      )
      .collect();

    if (recurringTasks.length === 0) {
      console.log(`[generateRecurringTasks] No active recurring tasks found`);
      return { generatedCount: 0, errorCount: 0, skipped: true };
    }

    let generatedCount = 0;
    let errorCount = 0;

    // Process all recurring tasks
    for (const recurringTask of recurringTasks) {
      try {
        if (!recurringTask.schedule?.interval || !recurringTask.nextRunDate) {
          continue;
        }
        
        // Get the task owner's timezone
        const user = await ctx.db.get(recurringTask.userId) as Doc<"users"> | null;
        if (!user) {
          continue;
        }
        
        const timezone = user.timezone ?? "America/Denver";
        const userLocalNow = dayjs().tz(timezone);
        const todayLocal = userLocalNow.startOf("day");
        
        // Type guard: we already checked schedule.interval exists above
        const schedule = recurringTask.schedule!;
        const interval = schedule.interval!;
        
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
          continue;
        }
        
        const taskDueDate = todayLocal.format("YYYY-MM-DD");
        
        // Prevent duplicates
        const existingTask = await ctx.db
          .query("tasks")
          .withIndex("by_recurringTaskId", (q) =>
            q.eq("recurringTaskId", recurringTask._id)
          )
          .filter((q) => q.eq(q.field("due"), taskDueDate))
          .first();
        
        if (existingTask) {
          continue;
        }
        
        if (dryRun) {
          generatedCount++;
          continue;
        }
        
        // Create the new task instance
        await ctx.db.insert("tasks", {
          name: recurringTask.name,
          status: "todo",
          notes: "",
          priority: "normal",
          due: taskDueDate,
          recurringTaskId: recurringTask._id,
          userId: recurringTask.userId,
        });
        
        // Update recurring task's next run date
        const nextRunDate = calculateNextRunDate(
          {
            interval: interval,
            time: schedule.time,
            daysOfWeek: schedule.daysOfWeek,
            dayOfMonth: schedule.dayOfMonth,
          },
          todayLocal
        );
        
        await ctx.db.patch(recurringTask._id, {
          nextRunDate: nextRunDate,
          updated: Date.now(),
        });
        
        generatedCount++;
      } catch (error) {
        errorCount++;
        console.error(`[generateRecurringTasks] Error generating task "${recurringTask.name}":`, error);
      }
    }

    console.log(`[generateRecurringTasks] Completed: ${generatedCount} generated, ${errorCount} errors${dryRun ? " (DRY RUN - no changes made)" : ""}`);
    
    return { generatedCount, errorCount, skipped: false };
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
      return await generateRecurringTasksCore(ctx, false, false);
    },
  });

  /**
   * Test mutation: Dry run mode that shows what would happen without making changes.
   * Can be called manually to test the logic at any time, regardless of current time.
   */
  export const testGenerateRecurringTasks = internalMutation({
    async handler(ctx) {
      return await generateRecurringTasksCore(ctx, true, true);
    },
  });

/**
 * Formats recurrence text from recurring task schema format.
 * This is a pure function that can be used on both client and server.
 * @param schedule - The schedule object from recurring task schema
 * @param recurrenceType - "schedule" or "completion"
 * @param referenceDate - Optional reference date string (YYYY-MM-DD) for displaying day names (defaults to today)
 * @returns Formatted recurrence text string, or null if schedule is invalid
 */
export function formatRecurrenceText(
  schedule: {
    interval?: {
      amount: number;
      unit: "day" | "week" | "month";
    };
    daysOfWeek?: number[];
    dayOfMonth?: number;
  } | undefined,
  recurrenceType: "schedule" | "completion",
  referenceDate?: string // YYYY-MM-DD format
): string | null {
  if (!schedule?.interval) {
    return null;
  }

  const { interval, daysOfWeek } = schedule;
  const { amount, unit } = interval;
  const isCompletion = recurrenceType === "completion";
  const afterCompletion = isCompletion ? " after completion" : "";

  // Helper to format days of week array
  const formatDaysOfWeek = (days: number[]): string => {
    const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days
      .sort((a, b) => a - b)
      .map((d) => DAYS_OF_WEEK[d])
      .join(", ");
  };

  // Helper to get day name from date
  const getDayNameFromDate = (dateStr: string): string => {
    const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = dayjs(dateStr, "YYYY-MM-DD");
    return DAYS_OF_WEEK[date.day()];
  };

  // Helper to format day of month
  const formatDayOfMonth = (day: number): string => {
    const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
    return `The ${day}${suffix} day`;
  };

  // Helper to get month name
  const getMonthNameFromDate = (dateStr: string): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = dayjs(dateStr, "YYYY-MM-DD");
    return months[date.month()];
  };

  // Get reference date (due date or today)
  const refDateStr = referenceDate || dayjs().format("YYYY-MM-DD");
  const refDate = dayjs(refDateStr, "YYYY-MM-DD");

  // Special handling for weekly with specific days
  if (unit === "week" && daysOfWeek && daysOfWeek.length > 0) {
    const selectedDayNames = formatDaysOfWeek(daysOfWeek);
    if (isCompletion) {
      if (amount === 1) {
        return `1 week after completion`;
      } else {
        return `${amount} weeks after completion`;
      }
    }
    if (amount === 1) {
      return `Weekly on ${selectedDayNames}`;
    } else {
      return `Every ${amount} weeks on ${selectedDayNames}`;
    }
  }

  // Handle monthly with day of month
  if (unit === "month" && amount === 1) {
    if (isCompletion) {
      return `1 month after completion`;
    }
    const dayOfMonth = refDate.date();
    return `Monthly (${formatDayOfMonth(dayOfMonth)})`;
  }

  // Handle yearly (12 months)
  if (unit === "month" && amount === 12) {
    if (isCompletion) {
      return `1 year after completion`;
    }
    const month = getMonthNameFromDate(refDateStr);
    const day = refDate.date();
    return `Yearly (on ${month} ${day})`;
  }

  // Handle weekday (Mon-Fri = 1-5)
  if (unit === "week" && daysOfWeek && daysOfWeek.length === 5 && 
      daysOfWeek.every(d => [1, 2, 3, 4, 5].includes(d))) {
    return isCompletion ? "Every Weekday after completion" : "Every Weekday";
  }

  // Handle daily
  if (unit === "day" && amount === 1) {
    return isCompletion ? "Daily after completion" : "Daily";
  }

  // Generic format for other intervals
  const unitLabel = unit === "day" ? "day" : unit === "week" ? "week" : "month";
  const pluralUnit = amount !== 1 ? `${unitLabel}s` : unitLabel;
  
  // For weekly without specific days, show the day name
  if (unit === "week" && amount === 1 && !isCompletion) {
    return `Weekly on ${getDayNameFromDate(refDateStr)}`;
  }

  return `${amount} ${pluralUnit}${afterCompletion}`;
}