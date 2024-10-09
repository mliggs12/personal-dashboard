import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async (ctx) => {
  return await ctx.db.query("intentions").collect();
});

export const get = query({
  args: {
    intentionId: v.id("intentions"),
  },
  async handler(ctx, { intentionId }) {
    const intention = await ctx.db.get(intentionId);

    return intention;
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("tithe"),
      v.literal("allow"),
      v.literal("done"),
    ),
  },
  async handler(ctx, { status }) {
    const intentions =
      (await ctx.db
        .query("intentions")
        .filter((q) => q.eq(q.field("status"), status))
        .collect()) || [];

    return intentions;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    whatStatements: v.optional(v.array(v.string())),
    whyStatements: v.optional(v.array(v.string())),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(
    ctx,
    { title, whatStatements, whyStatements, emotionId, notes },
  ) {
    if (title === undefined) {
      title = "";
    }

    const intentionId = await ctx.db.insert("intentions", {
      title,
      status: "draft",
      whatStatements,
      whyStatements,
      emotionId,
      notes,
    });

    return intentionId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("intentions"),
  },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("intentions"),
    title: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("tithe"),
        v.literal("allow"),
        v.literal("done"),
      ),
    ),
    whatStatements: v.optional(v.array(v.string())),
    whyStatements: v.optional(v.array(v.string())),
    emotionId: v.optional(v.id("emotions")),
    notes: v.optional(v.string()),
  },
  async handler(
    ctx,
    { id, title, status, whatStatements, whyStatements, emotionId, notes },
  ) {
    try {
      const existingIntention = await ctx.db.get(id);

      const updatedIntention = {
        ...existingIntention,
        title: title ?? existingIntention?.title ?? "",
        status: status ?? existingIntention?.status ?? "draft",
        whatStatements:
          whatStatements ?? existingIntention?.whatStatements ?? [],
        whyStatements: whyStatements ?? existingIntention?.whyStatements ?? [],
        emotionId: emotionId ?? existingIntention?.emotionId,
        notes: notes ?? existingIntention?.notes,
        updatedAt: Date.now(),
      };

      await ctx.db.patch(id, updatedIntention);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});

export const updateEmotion = mutation({
  args: {
    id: v.id("intentions"),
    emotionId: v.id("emotions"),
  },
  async handler(ctx, { id, emotionId }) {
    await ctx.db.patch(id, {
      emotionId,
      updatedAt: Date.now(),
    });
  },
});

export const updateNotes = mutation({
  args: {
    intentionId: v.id("intentions"),
    notes: v.string(),
  },
  async handler(ctx, { intentionId, notes }) {
    await ctx.db.patch(intentionId, { notes, updatedAt: Date.now() });
  },
});

export const addWhyStatement = mutation({
  args: {
    intentionId: v.id("intentions"),
    statement: v.string(),
  },
  async handler(ctx, { intentionId, statement }) {
    const intention = await ctx.db.get(intentionId);
    if (!intention) {
      throw new Error("Intention not found");
    }

    const whyStatements = intention.whyStatements ?? [];
    whyStatements.push(statement);

    await ctx.db.patch(intentionId, { whyStatements, updatedAt: Date.now() });
  },
});

export const addWhatStatement = mutation({
  args: {
    intentionId: v.id("intentions"),
    statement: v.string(),
  },
  async handler(ctx, { intentionId, statement }) {
    const intention = await ctx.db.get(intentionId);
    if (!intention) {
      throw new Error("Intention not found");
    }

    const whatStatements = intention.whatStatements ?? [];
    whatStatements.push(statement);

    await ctx.db.patch(intentionId, { whatStatements, updatedAt: Date.now() });
  },
});
