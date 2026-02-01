import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { createNextWhenDoneTask } from "./recurringTasksHelpers";
import { getCurrentUserOrThrow, userByExternalId } from "./users";

export const list = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.get(taskId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    date: v.optional(v.string()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    userId: v.optional(v.string()),
  },
  async handler(
    ctx,
    {
      name,
      status,
      priority,
      notes,
      due,
      date,
      recurringTaskId,
      intentionId,
      parentTaskId,
      tagIds,
      userId,
    },
  ) {
    let user;
    if (userId) {
      user = await userByExternalId(ctx, userId);
    } else {
      user = await getCurrentUserOrThrow(ctx);
    }

    const taskId = await ctx.db.insert("tasks", {
      name,
      status: status || "todo",
      priority: priority || "normal",
      notes: notes || "",
      due,
      date,
      recurringTaskId,
      intentionId,
      parentTaskId,
      tagIds,
      userId: user!._id,
    });

    return taskId;
  },
});


export const remove = mutation({
  args: { 
    taskId: v.id("tasks"),
    deleteScope: v.optional(v.union(v.literal("this"), v.literal("thisAndFollowing"), v.literal("all"))),
  },
  async handler(ctx, { taskId, deleteScope = "this" }) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    const recurringTaskId = task.recurringTaskId;

    // If this is not a recurring task, just delete it
    if (!recurringTaskId) {
      await ctx.db.delete(taskId);
      return;
    }

    // Handle different delete scopes for recurring tasks
    if (deleteScope === "all") {
      // Delete all instances with the same recurringTaskId
      const allInstances = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
        .collect();

      // Delete all instances
      for (const instance of allInstances) {
        await ctx.db.delete(instance._id);
      }

      // Delete the parent recurring task
      await ctx.db.delete(recurringTaskId);
      console.log(
        `Deleted all instances of recurring task "${task.name}" (${allInstances.length} instances) and parent recurring task (${recurringTaskId})`
      );
    } else if (deleteScope === "thisAndFollowing") {
      // Delete this instance and all future instances (date >= current task date)
      const taskDate = task.date;
      
      if (!taskDate) {
        // If task has no date, treat as "this" only
        await ctx.db.delete(taskId);
        
        // Check if there are any other task instances still using this recurring task
        const remainingInstances = await ctx.db
          .query("tasks")
          .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
          .collect();

        // If no other instances exist, delete the base recurring task
        if (remainingInstances.length === 0) {
          await ctx.db.delete(recurringTaskId);
          console.log(
            `Deleted task "${task.name}" (${taskId}) and cleaned up unused recurring task (${recurringTaskId})`
          );
        } else {
          console.log(
            `Deleted task "${task.name}" (${taskId}). Recurring task (${recurringTaskId}) kept active with ${remainingInstances.length} remaining instances.`
          );
        }
      } else {
        // Get all instances with same recurringTaskId and date >= taskDate
        const allInstances = await ctx.db
          .query("tasks")
          .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
          .collect();

        // Filter to instances with date >= taskDate (or no date, which we'll treat as future)
        const instancesToDelete = allInstances.filter((instance) => {
          if (instance._id === taskId) return true; // Always delete the current task
          if (!instance.date) return false; // Don't delete instances without dates (they're not "following")
          return instance.date >= taskDate; // Delete if date is >= current task date
        });

        // Delete all matching instances
        for (const instance of instancesToDelete) {
          await ctx.db.delete(instance._id);
        }

        // Deactivate the recurring task to prevent future generation
        await ctx.db.patch(recurringTaskId, {
          isActive: false,
          updated: Date.now(),
        });

        console.log(
          `Deleted task "${task.name}" (${taskId}) and ${instancesToDelete.length - 1} following instances. Recurring task (${recurringTaskId}) deactivated.`
        );
      }
    } else {
      // Default: "this" - Delete only the current task instance
      await ctx.db.delete(taskId);

      // Check if there are any other task instances still using this recurring task
      const remainingInstances = await ctx.db
        .query("tasks")
        .withIndex("by_recurringTaskId", (q) => q.eq("recurringTaskId", recurringTaskId))
        .collect();

      // If no other instances exist, delete the base recurring task
      if (remainingInstances.length === 0) {
        await ctx.db.delete(recurringTaskId);
        console.log(
          `Deleted task "${task.name}" (${taskId}) and cleaned up unused recurring task (${recurringTaskId})`
        );
      } else {
        console.log(
          `Deleted task "${task.name}" (${taskId}). Recurring task (${recurringTaskId}) kept active with ${remainingInstances.length} remaining instances.`
        );
      }
    }
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    const task = await ctx.db.get(taskId);
    
    await ctx.db.patch(taskId, {
      status: "done",
      completed: Date.now(),
    });
    
    // Handle "whenDone" recurring tasks - create next instance immediately
    if (task?.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (recurringTask?.recurrenceType === "completion" && recurringTask.isActive) {
        await createNextWhenDoneTask(ctx, task, recurringTask);
      }
    }
    
    return task;
  },
});

export const unCompleteTask = mutation({
  args: { taskId: v.id("tasks") },
  async handler(ctx, { taskId }) {
    return await ctx.db.patch(taskId, {
      status: "todo",
      completed: undefined,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    date: v.optional(v.string()),
    completed: v.optional(v.number()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    userId: v.optional(v.id("users")),
  },
  async handler(
    ctx,
    {
      taskId,
      name,
      status,
      priority,
      notes,
      due,
      date,
      completed,
      recurringTaskId,
      intentionId,
      parentTaskId,
      tagIds,
      userId,
    },
  ) {
    const task = await ctx.db.get(taskId);
    if (task === null) throw new Error("Could not find task");

    const now = Date.now();
    const wasNotDone = task.status !== "done";
    const isNowDone = status === "done";

    // Determine the final status
    let finalStatus = status !== undefined ? status : task.status;
    
    // Determine the final due date value
    let finalDue = due !== undefined ? (due === "" ? undefined : due) : task.due;
    
    // Determine the final date value
    let finalDate = date !== undefined ? (date === "" ? undefined : date) : task.date;
    
    // Backlog tasks cannot have dates or due dates
    // If task is being set to backlog, remove both due date and date
    if (status === "backlog") {
      finalDue = undefined;
      finalDate = undefined;
    }
    
    // If task is currently backlog and a due date or date is being set,
    // automatically change status to todo (unless status is explicitly being set)
    // This allows users to set dates on backlog tasks, which promotes them to todo
    if (task.status === "backlog") {
      const isSettingDue = due !== undefined && due !== "";
      const isSettingDate = date !== undefined && date !== "";
      
      if ((isSettingDue || isSettingDate) && status === undefined) {
        // Only change to todo if status wasn't explicitly set and date/due is being set
        finalStatus = "todo";
      }
    }
    
    await ctx.db.patch(taskId, {
      name: name !== undefined ? name : task.name,
      status: finalStatus,
      priority: priority !== undefined ? priority : task.priority,
      notes: notes !== undefined ? notes : task.notes,
      due: finalDue,
      date: finalDate,
      completed: completed !== undefined ? completed : (isNowDone && wasNotDone ? now : task.completed),
      recurringTaskId: recurringTaskId !== undefined ? recurringTaskId : task.recurringTaskId,
      intentionId: intentionId !== undefined ? intentionId : task.intentionId,
      parentTaskId: parentTaskId !== undefined ? parentTaskId : task.parentTaskId,
      tagIds: tagIds !== undefined ? tagIds : task.tagIds,
      userId: userId !== undefined ? userId : task.userId,
      updated: now,
    });

    // When tags are updated on a recurring task instance, also update the recurring task template
    // This ensures future instances inherit the updated tags
    if (tagIds !== undefined && task.recurringTaskId) {
      await ctx.db.patch(task.recurringTaskId, {
        tagIds: tagIds,
        updated: now,
      });
    }

    // Handle "whenDone" recurring tasks - create next instance immediately
    // Only trigger if transitioning from not-done to done (prevents duplicate calls)
    if (wasNotDone && isNowDone && task.recurringTaskId) {
      const recurringTask = await ctx.db.get(task.recurringTaskId);
      if (recurringTask?.recurrenceType === "completion" && recurringTask.isActive) {
        await createNextWhenDoneTask(ctx, task, recurringTask);
      }
    }
  },
});

export const search = query({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withSearchIndex("search_name", (q) =>
        q.search("name", query).eq("userId", user._id),
      )
      .collect();
  },
});

// ============================================================================
// TASKS CARD
// ============================================================================

/**
 * Fetches all active tasks for the current user.
 * Active tasks are those that are:
 * - Not completed (completed === undefined)
 * - Not archived (status !== "archived")
 * 
 * Filtering by view (Today/Backlog/Deadline) happens client-side.
 */
export const allActiveTasks = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Fetch all active tasks (not completed, not archived)
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_completed", (q) => q.eq("userId", user._id).eq("completed", undefined))
      .collect();
  },
});

// ============================================================================
// PROJECTS
// ============================================================================

export const createForProject = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()),
    parentTaskId: v.optional(v.id("tasks")),
    userId: v.optional(v.id("users")),
  },
  async handler(
    ctx,
    { name, status, priority, notes, due, projectId, parentTaskId, userId },
  ) {
    if (!userId) {
      const user = await getCurrentUserOrThrow(ctx);
      userId = user._id;
    }

    return await ctx.db.insert("tasks", {
      name,
      projectId,
      status: status || "todo",
      priority: priority || "normal",
      notes: notes || "",
      due,
      parentTaskId,
      updated: Date.now(),
      userId: userId,
    });
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  async handler(ctx, { projectId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
  },
});