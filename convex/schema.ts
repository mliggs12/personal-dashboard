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
    name: v.string(),
    date: v.optional(v.string()),
    isTemplate: v.boolean(),
    length: v.number(),
  }).index("by_date", ["date"]),
  water_logs: defineTable({
    date: v.string(), // YYYY-MM-DD
    consumed: v.number(),
  }).index("by_date", ["date"]),
  intentions: defineTable({
    title: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("draft"),
    ),
    whatStatements: v.optional(v.array(v.string())),
    whyStatements: v.optional(v.array(v.string())),
    emotionIds: v.optional(v.array(v.id("emotions"))),
    notes: v.optional(v.string()),
  }),
  emotions: defineTable({
    name: v.string(),
  }),
  beliefs: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("archived"),
    ),
  }),
  mindDumpStatements: defineTable({
    text: v.string(),
    elevated: v.boolean(),
  }),
});
