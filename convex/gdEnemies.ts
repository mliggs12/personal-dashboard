import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const enemies = await ctx.db
      .query("gdEnemies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by name
    return enemies.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const get = query({
  args: { enemyId: v.id("gdEnemies") },
  async handler(ctx, { enemyId }) {
    const enemy = await ctx.db.get(enemyId);
    if (!enemy) return null;

    // Populate stages
    const stages = await Promise.all(
      enemy.stageIds.map((stageId) => ctx.db.get(stageId))
    );

    return {
      ...enemy,
      stages: stages.filter((s) => s !== null),
    };
  },
});

export const getByStage = query({
  args: { stageId: v.id("gdStages") },
  async handler(ctx, { stageId }) {
    const stage = await ctx.db.get(stageId);
    if (!stage) return [];

    const enemies = await Promise.all(
      stage.enemyIds.map((enemyId) => ctx.db.get(enemyId))
    );

    return enemies.filter((e) => e !== null);
  },
});

export const create = mutation({
  args: {
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
  },
  async handler(ctx, { name, weaknesses, resistances, elite, feature, info, image, stageIds }) {
    const user = await getCurrentUserOrThrow(ctx);

    const enemyId = await ctx.db.insert("gdEnemies", {
      name,
      weaknesses,
      resistances,
      elite,
      feature,
      info,
      image,
      stageIds,
      userId: user._id,
      updated: Date.now(),
    });

    // Update stages' enemyIds arrays
    for (const stageId of stageIds) {
      const stage = await ctx.db.get(stageId);
      if (stage) {
        const updatedEnemyIds = [...stage.enemyIds];
        if (!updatedEnemyIds.includes(enemyId)) {
          updatedEnemyIds.push(enemyId);
          await ctx.db.patch(stageId, {
            enemyIds: updatedEnemyIds,
            updated: Date.now(),
          });
        }
      }
    }

    return enemyId;
  },
});

export const update = mutation({
  args: {
    enemyId: v.id("gdEnemies"),
    name: v.optional(v.string()),
    weaknesses: v.optional(v.array(v.object({
      type: v.string(),
      multiplier: v.union(v.literal(0.5), v.literal(1.0)),
    }))),
    resistances: v.optional(v.array(v.string())),
    elite: v.optional(v.boolean()),
    feature: v.optional(v.string()),
    info: v.optional(v.string()),
    image: v.optional(v.string()),
    stageIds: v.optional(v.array(v.id("gdStages"))),
  },
  async handler(ctx, { enemyId, name, weaknesses, resistances, elite, feature, info, image, stageIds }) {
    const enemy = await ctx.db.get(enemyId);
    if (!enemy) {
      throw new Error("Enemy not found");
    }

    // Handle stage relationship updates
    if (stageIds !== undefined) {
      const oldStageIds = enemy.stageIds;
      const newStageIds = stageIds;

      // Remove enemy from stages that are no longer in the list
      const removedStageIds = oldStageIds.filter((id) => !newStageIds.includes(id));
      for (const stageId of removedStageIds) {
        const stage = await ctx.db.get(stageId);
        if (stage) {
          await ctx.db.patch(stageId, {
            enemyIds: stage.enemyIds.filter((id) => id !== enemyId),
            updated: Date.now(),
          });
        }
      }

      // Add enemy to new stages
      const addedStageIds = newStageIds.filter((id) => !oldStageIds.includes(id));
      for (const stageId of addedStageIds) {
        const stage = await ctx.db.get(stageId);
        if (stage) {
          const updatedEnemyIds = [...stage.enemyIds];
          if (!updatedEnemyIds.includes(enemyId)) {
            updatedEnemyIds.push(enemyId);
            await ctx.db.patch(stageId, {
              enemyIds: updatedEnemyIds,
              updated: Date.now(),
            });
          }
        }
      }
    }

    await ctx.db.patch(enemyId, {
      name: name ?? enemy.name,
      weaknesses: weaknesses ?? enemy.weaknesses,
      resistances: resistances ?? enemy.resistances,
      elite: elite ?? enemy.elite,
      feature: feature ?? enemy.feature,
      info: info ?? enemy.info,
      image: image !== undefined ? image : enemy.image,
      stageIds: stageIds ?? enemy.stageIds,
      updated: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { enemyId: v.id("gdEnemies") },
  async handler(ctx, { enemyId }) {
    const enemy = await ctx.db.get(enemyId);
    if (!enemy) {
      throw new Error("Enemy not found");
    }

    // Remove enemy references from stages
    for (const stageId of enemy.stageIds) {
      const stage = await ctx.db.get(stageId);
      if (stage) {
        await ctx.db.patch(stageId, {
          enemyIds: stage.enemyIds.filter((id) => id !== enemyId),
          updated: Date.now(),
        });
      }
    }

    await ctx.db.delete(enemyId);
  },
});

