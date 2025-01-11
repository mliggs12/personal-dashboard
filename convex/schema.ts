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
    userId: v.optional(v.id("users")),
  }),

  schedules: defineTable({
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    isTemplate: v.boolean(),
    length: v.optional(v.number()),
    updated: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }).index("by_user", ["userId"]),

  // Creativity
  beliefs: defineTable({
    title: v.string(),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("done"),
        v.literal("archived"),
      ),
    ),
    notes: v.optional(v.string()),
    updated: v.number(),
    intentionId: v.optional(v.id("intentions")),
    userId: v.id("users"),
  })
    .index("by_intention", ["intentionId"])
    .index("by_user", ["userId"]),

  emotions: defineTable({
    label: v.string(),
    value: v.string(),
    color: v.optional(v.string()),
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
    updated: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  notes: defineTable({
    title: v.string(),
    text: v.string(),
    updated: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  // Tithe/Focus Sessions as defined in Interstitch
  // All parameters are optional to allow for future use cases
  sessions: defineTable({
    duration: v.number(), // seconds
    pauseDuration: v.optional(v.number()), // seconds
    notes: v.optional(v.string()),
    what: v.optional(v.string()),
    why: v.optional(v.string()),
    emotionId: v.optional(v.id("emotions")),
    intentionId: v.optional(v.id("intentions")),
    userId: v.optional(v.id("users")),
  }).index("by_user", ["userId"]),

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
    userId: v.optional(v.id("users")),
  })
    .index("by_intentionId", ["intentionId"])
    .index("by_type", ["type"])
    .index("by_user", ["userId"]),

  // Task Management
  projects: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("backlog"),
      v.literal("active"),
      v.literal("done"),
      v.literal("archived"),
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    ),
    notes: v.optional(v.string()),
    updated: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
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
    due: v.optional(v.string()), // YYYY-MM-DD
    completed: v.optional(v.number()),
    updated: v.optional(v.number()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    userId: v.optional(v.id("users")),
  })
    .index("by_recurringTaskId", ["recurringTaskId"])
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),

  recurringTasks: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    ),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    due: v.string(),
    updated: v.number(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("3-day"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("daysAfter"),
    ),
    type: v.union(v.literal("onSchedule"), v.literal("whenDone")),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  sleepRecords: defineTable({
    sleepStart: v.number(),
    sleepEnd: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    updated: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_active_user", ["isActive", "userId"]),

  waterLogEntries: defineTable({
    amount: v.number(),
    timestamp: v.number(),
    type: v.optional(v.string()), // eg. "coffee", "energy drink", "sports drink", "juice"
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  users: defineTable({
    name: v.string(),
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),

  // Messenger/Chat
  chats: defineTable({
    chatterOneId: v.id("users"),
    chatterTwoId: v.id("users"),
    updated: v.number(),
  })
    .index("by_chatterOneId", ["chatterOneId", "chatterTwoId"])
    .index("by_chatterTwoId", ["chatterTwoId", "chatterOneId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    authorId: v.id("users"),
  }).index("by_chatId", ["chatId"]),

  userChats: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    updated: v.number(),
  }),
});
