import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    index: v.number(),
    name: v.string(),
    start: v.number(), // Minutes since midnight
    length: v.number(), // Duration in minutes
    isForced: v.boolean(),
    isRigid: v.boolean(),
    scheduleId: v.id("schedules"),
  }),

  schedules: defineTable({
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    isTemplate: v.boolean(),
    length: v.optional(v.number()),
  }).index("by_date", ["date"]),

  water_logs: defineTable({
    date: v.string(), // YYYY-MM-DD
    consumed: v.number(),
  }).index("by_date", ["date"]),

  intentions: defineTable({
    title: v.string(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("to_tithe"),
        v.literal("allowing"),
        v.literal("done"),
      ),
    ),
    whatStatements: v.optional(v.array(v.string())),
    whyStatements: v.optional(v.array(v.string())),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }),

  intentions_handler: defineTable({
    count: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  emotions: defineTable({
    label: v.string(),
    value: v.string(),
    color: v.optional(v.string()),
  }),

  beliefs: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("archived"),
        v.literal("active"),
      ),
    ),
  }),

  mindDumpStatements: defineTable({
    text: v.string(),
    elevated: v.boolean(),
  }),

  // Tithe Tracker
  // ------------------
  // Projects is more general and can refer to a task, intention, focus object, etc.
  projects: defineTable({
    name: v.string(),
    color: v.optional(
      v.union(
        v.literal("red"),
        v.literal("blue"),
        v.literal("green"),
        v.literal("yellow"),
        v.literal("pink"),
        v.literal("purple"),
        v.literal("orange"),
      ),
    ),
  }),

  // Tithe/Focus Sessions as defined in Interstitch
  // All parameters are optional to allow for future use cases
  sessions: defineTable({
    duration: v.optional(v.number()), // seconds
    pauseDuration: v.optional(v.number()), // seconds
    notes: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  }).index("by_projectId", ["projectId"]),

  // Mundane Manager
  tasks: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
      v.literal("archived"),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    isPreselected: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  }),

  stringAnswers: defineTable({
    text: v.string(),
  }),

  // Main Dashboard
  notes: defineTable({
    title: v.optional(v.string()),
    text: v.optional(v.string()),
  }),

  // Files
  files: defineTable({
    body: v.id("_storage"),
    format: v.string(),
  }),
});
