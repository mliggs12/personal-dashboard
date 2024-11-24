import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // SM Plan Clone
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
    userId: v.optional(v.id("users")),
  }),

  emotions: defineTable({
    label: v.string(),
    value: v.string(),
    color: v.optional(v.string()),
  }),

  events: defineTable({
    summary: v.string(), // The title of the event
    start: v.string(), // For a recurring event, this is the start time of the first instance
    end: v.optional(v.string()),
    updated: v.optional(v.string()),
    description: v.optional(v.string()),
    colorId: v.optional(v.id("colors")),
    // For a recurring event, this is the time at which this event would start according to the recurrence data in the recurrence event identified by recurringEventId
    originalStart: v.optional(v.string()),
    recurrence: v.optional(v.string()), // "RRULE:FREQ=DAILY;INTERVAL=1" is an event that recurs every day
    recurringEventId: v.optional(v.id("events")), // If this event is a recurring event, this will be the id of the event it is based on
    userId: v.optional(v.id("users")),
  }),

  intentions: defineTable({
    title: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("tithe"),
        v.literal("allow"),
        v.literal("done"),
      ),
    ),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }),

  notes: defineTable({
    text: v.optional(v.string()),
    title: v.optional(v.string()),
    updated: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }),

  // Tithe/Focus Sessions as defined in Interstitch
  // All parameters are optional to allow for future use cases
  sessions: defineTable({
    duration: v.number(), // seconds
    pauseDuration: v.optional(v.number()), // seconds
    notes: v.optional(v.string()),
    what: v.optional(v.string()),
    why: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
    userId: v.optional(v.id("users")),
  }),

  statements: defineTable({
    date: v.optional(v.string()),
    isComplete: v.optional(v.boolean()),
    text: v.string(),
    type: v.union(
      v.literal("mind_dump"),
      v.literal("negative"),
      v.literal("what"),
      v.literal("why"),
    ),
    intentionId: v.optional(v.id("intentions")),
  })
    .index("by_intentionId", ["intentionId"])
    .index("by_type", ["type"]),

  tasks: defineTable({
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done"),
        v.literal("cancelled"),
        v.literal("archived"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    due: v.optional(v.string()), // YYYY-MM-DD
    completed: v.optional(v.number()),
    updated: v.optional(v.number()),
    frequency: v.optional(
      v.union(v.literal("daily"), v.literal("3-day"), v.literal("weekly")), // omitted for single tasks or instances of recurring tasks
    ),
    recurCount: v.optional(v.number()),
    recurringTaskId: v.optional(v.id("tasks")), // For an instance of a recurring task, this is the id of the parent recurring task
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    userId: v.optional(v.id("users")),
  }),

  waterLog: defineTable({
    consumed: v.number(),
    date: v.string(), // YYYY-MM-DD
  }).index("by_date", ["date"]),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
