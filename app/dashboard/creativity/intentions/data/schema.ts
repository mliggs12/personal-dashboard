import { z } from "zod";

export const intentionSchema = z.object({
  _id: z.string(),
  title: z.string(),
  status: z.string(),
  emotionId: z.optional(z.string()),
  updated: z.optional(z.number()),
  _creationTime: z.optional(z.number()),
});

export type Intention = z.infer<typeof intentionSchema>;

