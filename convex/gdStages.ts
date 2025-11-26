import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const stages = await ctx.db
      .query("gdStages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by number ascending
    return stages.sort((a, b) => a.number - b.number);
  },
});

export const get = query({
  args: { stageId: v.id("gdStages") },
  async handler(ctx, { stageId }) {
    const stage = await ctx.db.get(stageId);
    if (!stage) return null;

    // Populate enemies
    const enemies = await Promise.all(
      stage.enemyIds.map((enemyId) => ctx.db.get(enemyId))
    );

    return {
      ...stage,
      enemies: enemies.filter((e) => e !== null),
    };
  },
});

export const getByNumber = query({
  args: {
    number: v.number(),
    difficulty: v.union(v.literal("normal"), v.literal("elite")),
  },
  async handler(ctx, { number, difficulty }) {
    const user = await getCurrentUserOrThrow(ctx);

    const stage = await ctx.db
      .query("gdStages")
      .withIndex("by_user_number", (q) => q.eq("userId", user._id).eq("number", number))
      .filter((q) => q.eq(q.field("difficulty"), difficulty))
      .first();

    if (!stage) return null;

    // Populate enemies
    const enemies = await Promise.all(
      stage.enemyIds.map((enemyId) => ctx.db.get(enemyId))
    );

    return {
      ...stage,
      enemies: enemies.filter((e) => e !== null),
    };
  },
});

export const create = mutation({
  args: {
    number: v.number(),
    difficulty: v.union(v.literal("normal"), v.literal("elite")),
    enemyIds: v.array(v.id("gdEnemies")),
  },
  async handler(ctx, { number, difficulty, enemyIds }) {
    const user = await getCurrentUserOrThrow(ctx);

    const stageId = await ctx.db.insert("gdStages", {
      number,
      difficulty,
      enemyIds,
      userId: user._id,
      updated: Date.now(),
    });

    // Update enemies' stageIds arrays
    for (const enemyId of enemyIds) {
      const enemy = await ctx.db.get(enemyId);
      if (enemy) {
        const updatedStageIds = [...enemy.stageIds];
        if (!updatedStageIds.includes(stageId)) {
          updatedStageIds.push(stageId);
          await ctx.db.patch(enemyId, {
            stageIds: updatedStageIds,
            updated: Date.now(),
          });
        }
      }
    }

    return stageId;
  },
});

export const update = mutation({
  args: {
    stageId: v.id("gdStages"),
    number: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("normal"), v.literal("elite"))),
    enemyIds: v.optional(v.array(v.id("gdEnemies"))),
  },
  async handler(ctx, { stageId, number, difficulty, enemyIds }) {
    const stage = await ctx.db.get(stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }

    // Handle enemy relationship updates
    if (enemyIds !== undefined) {
      const oldEnemyIds = stage.enemyIds;
      const newEnemyIds = enemyIds;

      // Remove stage from enemies that are no longer in the list
      const removedEnemyIds = oldEnemyIds.filter((id) => !newEnemyIds.includes(id));
      for (const enemyId of removedEnemyIds) {
        const enemy = await ctx.db.get(enemyId);
        if (enemy) {
          await ctx.db.patch(enemyId, {
            stageIds: enemy.stageIds.filter((id) => id !== stageId),
            updated: Date.now(),
          });
        }
      }

      // Add stage to new enemies
      const addedEnemyIds = newEnemyIds.filter((id) => !oldEnemyIds.includes(id));
      for (const enemyId of addedEnemyIds) {
        const enemy = await ctx.db.get(enemyId);
        if (enemy) {
          const updatedStageIds = [...enemy.stageIds];
          if (!updatedStageIds.includes(stageId)) {
            updatedStageIds.push(stageId);
            await ctx.db.patch(enemyId, {
              stageIds: updatedStageIds,
              updated: Date.now(),
            });
          }
        }
      }
    }

    await ctx.db.patch(stageId, {
      number: number ?? stage.number,
      difficulty: difficulty ?? stage.difficulty,
      enemyIds: enemyIds ?? stage.enemyIds,
      updated: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { stageId: v.id("gdStages") },
  async handler(ctx, { stageId }) {
    const stage = await ctx.db.get(stageId);
    if (!stage) {
      throw new Error("Stage not found");
    }

    // Remove stage references from enemies
    for (const enemyId of stage.enemyIds) {
      const enemy = await ctx.db.get(enemyId);
      if (enemy) {
        await ctx.db.patch(enemyId, {
          stageIds: enemy.stageIds.filter((id) => id !== stageId),
          updated: Date.now(),
        });
      }
    }

    await ctx.db.delete(stageId);
  },
});

