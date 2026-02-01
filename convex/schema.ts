import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // SM Plan Clone
  activities: defineTable({
    name: v.string(),
    length: v.number(), // Duration in minutes
    start: v.number(), // Start time in minutes from midnight
    order: v.number(),
    isForced: v.boolean(),
    isRigid: v.boolean(),
    scheduleId: v.id("schedules"),
  })
    .index("by_schedule", ["scheduleId"])
    .index("by_schedule_order", ["scheduleId", "order"]),

  schedules: defineTable({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()), // YYYY-MM-DD
    length: v.number(),
    start: v.optional(v.number()),
    isTemplate: v.boolean(),
    updated: v.number(),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

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

  statements: defineTable({
    text: v.string(),
    type: v.optional(
      v.union(
        v.literal("fb"),
        v.literal("mind_dump"),
        v.literal("negative"),
        v.literal("what"),
        v.literal("why"),
      )
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    updated: v.optional(v.number()),
    focusBlockId: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
    userId: v.optional(v.id("users")),
  })
    .index("by_focusBlockId", ["focusBlockId"])
    .index("by_intentionId", ["intentionId"])
    .index("by_type_user", ["type", "userId"])
    .index("by_user", ["userId"]),

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
    allowedAt: v.optional(v.number()), // Timestamp when status was changed to "allow"
    userId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  focusBlocks: defineTable({
    title: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("completed"),
      v.literal("archived")
    ),
    startStatement: v.optional(v.string()),
    endStatement: v.optional(v.string()),
    intentionId: v.optional(v.id("intentions")),
    updated: v.number(),
    userId: v.optional(v.string())
  })
    .index("by_user", ["userId"])
    .index("by_intention", ["intentionId"]),

  // Notes
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
    start: v.number(),
    end: v.number(),
    duration: v.number(), // Active focus time (excluding pauses)
    pauseDuration: v.optional(v.number()), // Total time spent paused
    totalElapsed: v.optional(v.number()), // Total wall-clock time (including pauses)
    timerType: v.optional(v.union(v.literal("session"), v.literal("tithe"))),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    emotionId: v.optional(v.id("emotions")),
    intentionId: v.optional(v.id("intentions")),
    updated: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_start", ["userId", "start"]),

  timers: defineTable({
    duration: v.number(),
    startTime: v.optional(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("running"),
      v.literal("paused"),
    ),
    timerType: v.optional(v.union(v.literal("session"), v.literal("tithe"))),
    intentionId: v.optional(v.id("intentions")),
    pausedTime: v.optional(v.number()), // Total time spent paused (in seconds)
    lastPauseStart: v.optional(v.string()), // When the current pause started
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  // Task Management
  tags: defineTable({
    name: v.string(),
    color: v.string(), // Hex color (e.g., "#3b82f6")
    userId: v.id("users"),
    updated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

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
    due: v.optional(v.string()), // YYYY-MM-DD format (legacy YYYY/MM/DD format also supported in queries)
    date: v.optional(v.string()), // YYYY-MM-DD format - arbitrary date parameter for work scheduling
    completed: v.optional(v.number()),
    updated: v.optional(v.number()),
    recurringTaskId: v.optional(v.id("recurringTasks")),
    intentionId: v.optional(v.id("intentions")),
    parentTaskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    tagIds: v.optional(v.array(v.id("tags"))),
    userId: v.optional(v.id("users")),
  })
    .index("by_recurringTaskId", ["recurringTaskId"])
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completed"])
    .index("by_user_completed_status", ["userId", "completed", "status"])
    .index("by_user_completed_due", ["userId", "completed", "due"])
    .index("by_user_completed_date", ["userId", "completed", "date"])
    .index("by_user_completed_status_due", ["userId", "completed", "status", "due"])
    .index("by_user_completed_status_date", ["userId", "completed", "status", "date"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),

  recurringTasks: defineTable({
    name: v.string(),
    schedule: v.optional(v.object({
      interval: v.optional(v.object({
        amount: v.number(),
        unit: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
      })),
      time: v.optional(v.string()),    // "06:00", local time
      daysOfWeek: v.optional(v.array(v.number())),   // For weekly: 0-6 (Sunday-Saturday)
      dayOfMonth: v.optional(v.number()),   // For monthly: 1-31
    })),
    recurrenceType: v.union(v.literal("schedule"), v.literal("completion")),
    nextRunDate: v.string(), // YYYY-MM-DD format
    date: v.optional(v.string()), // YYYY-MM-DD format - start date for the recurring schedule
    tagIds: v.optional(v.array(v.id("tags"))), // Tags to apply to generated task instances
    isActive: v.boolean(),
    updated: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_recurrenceType", ["userId", "recurrenceType"])
    .index("by_user_nextRunDate", ["userId", "nextRunDate"])
    .index("by_isActive_recurrenceType", ["isActive", "recurrenceType"]),

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
    timestamp: v.string(), // UTC ISO-8601 eg. "2025-07-02T20:15:00Z"
    type: v.optional(v.string()), // eg. "coffee", "energy drink", "sports drink", "juice"
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  users: defineTable({
    name: v.string(),
    externalId: v.string(),
    timezone: v.optional(v.string()), // IANA timezone string (e.g., "America/Denver", "America/New_York")
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

  journalEntries: defineTable({
    content: v.string(),
    type: v.union(
      v.literal("none"),
      v.literal("highlight"),
      v.literal("task"),
      v.literal("idea"),
    ),
    updated: v.number(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  userChats: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    updated: v.number(),
  }),

  // Lift
  systemExerciseCategories: defineTable({
    name: v.string(),
    colorId: v.optional(v.string()),
  }),

  systemExercises: defineTable({
    name: v.string(),
    categoryId: v.id("systemExerciseCategories"),
    type: v.union(v.literal("weight_and_reps"), v.literal("distance_and_time"), v.literal("reps"), v.literal("time")),
    notes: v.optional(v.string()),
  }).searchIndex("search_name", {
    searchField: "name",
    filterFields: ["categoryId"],
  }).index("by_category", ["categoryId"]),

  // Dashboard
  scratchPads: defineTable({
    content: v.string(),
    updated: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  banners: defineTable({
    content: v.string(),
    updated: v.number(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  inboxRecords: defineTable({
    content: v.optional(v.string()),
    processed: v.optional(v.boolean()),
    updated: v.number(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  // AI Chat
  aiConversations: defineTable({
    title: v.optional(v.string()),
    updated: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  aiMessages: defineTable({
    conversationId: v.id("aiConversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timestamp: v.number(),
    model: v.optional(v.string()), // AI model used for assistant messages
    duration: v.optional(v.number()), // Generation time in milliseconds
    tokens: v.optional(v.number()), // Token count (for future usage tracking)
  }).index("by_conversation", ["conversationId"]),

  tableStates: defineTable({
    userId: v.id("users"),
    tableId: v.string(),
    state: v.object({
      columnFilters: v.optional(v.any()),
      columnVisibility: v.optional(v.any()),
      sorting: v.optional(v.any()),
      pagination: v.optional(v.object({
        pageSize: v.number(),
      })),
    }),
    updated: v.number(),
  }).index("by_user_table", ["userId", "tableId"]),

  // Galaxy Defense
  gdStages: defineTable({
    number: v.number(),
    difficulty: v.union(v.literal("normal"), v.literal("elite")),
    enemyIds: v.array(v.id("gdEnemies")),
    userId: v.id("users"),
    updated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_number", ["userId", "number"])
    .index("by_user_difficulty", ["userId", "difficulty"]),

  gdEnemies: defineTable({
    name: v.string(),
    weaknesses: v.array(v.object({
      type: v.string(),
      multiplier: v.union(v.literal(0.5), v.literal(1.0)),
    })),
    resistances: v.array(v.string()),
    elite: v.boolean(),
    feature: v.string(),
    info: v.string(),
    image: v.optional(v.string()),
    stageIds: v.array(v.id("gdStages")),
    userId: v.id("users"),
    updated: v.number(),
  })
    .index("by_user", ["userId"]),
});
