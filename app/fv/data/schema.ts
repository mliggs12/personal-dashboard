import { z } from "zod";

export const taskSchema = z.object({
  _id: z.string(),
  name: z.string(),
  status: z.string(),
  priority: z.string(),
  notes: z.optional(z.string()),
  updatedAt: z.optional(z.number()),
});

export type Task = z.infer<typeof taskSchema>;
