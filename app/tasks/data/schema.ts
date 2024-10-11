import { z } from "zod";

export const taskSchema = z.object({
  _id: z.string(),
  name: z.string(),
  status: z.string(),
  priority: z.string(),
  dueAt: z.optional(z.string()),
  notes: z.optional(z.string()),
  intentionId: z.optional(z.string()),
  updatedAt: z.optional(z.number()),
  _creationTime: z.optional(z.number()),
});

export type Task = z.infer<typeof taskSchema>;
