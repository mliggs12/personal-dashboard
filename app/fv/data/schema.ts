import { z } from "zod";

export const taskSchema = z.object({
  _id: z.string(),
  name: z.string(),
  status: z.optional(
    z.enum(["backlog", "todo", "in_progress", "done", "cancelled", "archived"]),
  ),
  priority: z.optional(z.enum(["low", "medium", "high"])),
  isCompleted: z.optional(z.boolean()),
  isPreselected: z.optional(z.boolean()),
  updatedAt: z.optional(z.number()),
});

export type Task = z.infer<typeof taskSchema>;
