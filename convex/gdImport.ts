import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const importEnemies = mutation({
  args: {
    enemies: v.array(v.object({
      name: v.string(),
      weakness50_1: v.optional(v.string()),
      weakness50_2: v.optional(v.string()),
      weakness100: v.optional(v.string()),
      resistance50_1: v.optional(v.string()),
      resistance50_2: v.optional(v.string()),
      normalStages: v.optional(v.string()),
      eliteStages: v.optional(v.string()),
      isElite: v.boolean(),
    })),
  },
  async handler(ctx, { enemies }) {
    const user = await getCurrentUserOrThrow(ctx);

    // Get or create stage
    const getOrCreateStage = async (number: number, difficulty: "normal" | "elite"): Promise<string> => {
      const existingStage = await ctx.db
        .query("gdStages")
        .withIndex("by_user_number", (q) => q.eq("userId", user._id).eq("number", number))
        .filter((q) => q.eq(q.field("difficulty"), difficulty))
        .first();

      if (existingStage) {
        return existingStage._id;
      }

      // Create new stage
      const stageId = await ctx.db.insert("gdStages", {
        number,
        difficulty,
        enemyIds: [],
        userId: user._id,
        updated: Date.now(),
      });

      return stageId;
    };

    // Parse stage numbers from comma-separated string
    const parseStageNumbers = (stageString?: string): number[] => {
      if (!stageString || stageString.trim() === "") return [];
      return stageString
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
    };

    const createdEnemies: string[] = [];
    const stageMap = new Map<string, string>(); // key: "number-difficulty", value: stageId

    // First pass: collect all unique stages and create them
    for (const enemy of enemies) {
      const normalStages = parseStageNumbers(enemy.normalStages);
      const eliteStages = parseStageNumbers(enemy.eliteStages);

      for (const stageNum of normalStages) {
        const key = `${stageNum}-normal`;
        if (!stageMap.has(key)) {
          const stageId = await getOrCreateStage(stageNum, "normal");
          stageMap.set(key, stageId);
        }
      }

      for (const stageNum of eliteStages) {
        const key = `${stageNum}-elite`;
        if (!stageMap.has(key)) {
          const stageId = await getOrCreateStage(stageNum, "elite");
          stageMap.set(key, stageId);
        }
      }
    }

    // Second pass: create enemies and link to stages
    for (const enemy of enemies) {
      // Build weaknesses array
      const weaknesses: Array<{ type: string; multiplier: 0.5 | 1.0 }> = [];
      if (enemy.weakness50_1) {
        weaknesses.push({ type: enemy.weakness50_1, multiplier: 0.5 });
      }
      if (enemy.weakness50_2) {
        weaknesses.push({ type: enemy.weakness50_2, multiplier: 0.5 });
      }
      if (enemy.weakness100) {
        weaknesses.push({ type: enemy.weakness100, multiplier: 1.0 });
      }

      // Build resistances array
      const resistances: string[] = [];
      if (enemy.resistance50_1) {
        resistances.push(enemy.resistance50_1);
      }
      if (enemy.resistance50_2) {
        resistances.push(enemy.resistance50_2);
      }

      // Get stage IDs for this enemy (stages were already created in first pass)
      const stageIds: string[] = [];
      const normalStages = parseStageNumbers(enemy.normalStages);
      const eliteStages = parseStageNumbers(enemy.eliteStages);

      for (const stageNum of normalStages) {
        const key = `${stageNum}-normal`;
        const stageId = stageMap.get(key);
        if (stageId) {
          stageIds.push(stageId);
        }
      }

      for (const stageNum of eliteStages) {
        const key = `${stageNum}-elite`;
        const stageId = stageMap.get(key);
        if (stageId) {
          stageIds.push(stageId);
        }
      }

      // Check if enemy already exists
      const existingEnemies = await ctx.db
        .query("gdEnemies")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const existingEnemy = existingEnemies.find(
        (e) => e.name.toLowerCase() === enemy.name.toLowerCase()
      );

      if (existingEnemy) {
        // Update existing enemy
        await ctx.db.patch(existingEnemy._id, {
          weaknesses,
          resistances,
          elite: enemy.isElite,
          feature: "",
          stageIds: stageIds as any[],
          updated: Date.now(),
        });

        // Update stage relationships - remove from old stages, add to new ones
        const oldStageIds = existingEnemy.stageIds;
        const newStageIds = stageIds as any[];

        // Remove from stages that are no longer linked
        for (const oldStageId of oldStageIds) {
          if (!newStageIds.includes(oldStageId)) {
            const stage = await ctx.db.get(oldStageId as Id<"gdStages">);
            if (stage && "enemyIds" in stage) {
              const updatedEnemyIds = stage.enemyIds.filter((id) => id !== existingEnemy._id);
              await ctx.db.patch(oldStageId as Id<"gdStages">, {
                enemyIds: updatedEnemyIds,
                updated: Date.now(),
              });
            }
          }
        }

        // Add to new stages
        for (const stageId of newStageIds) {
          const stage = await ctx.db.get(stageId as Id<"gdStages">);
          if (stage && "enemyIds" in stage) {
            const updatedEnemyIds = [...stage.enemyIds];
            if (!updatedEnemyIds.includes(existingEnemy._id)) {
              updatedEnemyIds.push(existingEnemy._id);
              await ctx.db.patch(stageId as Id<"gdStages">, {
                enemyIds: updatedEnemyIds,
                updated: Date.now(),
              });
            }
          }
        }

        createdEnemies.push(existingEnemy._id);
      } else {
        // Create new enemy
        const enemyId = await ctx.db.insert("gdEnemies", {
          name: enemy.name,
          weaknesses,
          resistances,
          elite: enemy.isElite,
          feature: "",
          info: "",
          image: undefined,
          stageIds: stageIds as any[],
          userId: user._id,
          updated: Date.now(),
        });

        // Update stage relationships
        for (const stageId of stageIds) {
          const stage = await ctx.db.get(stageId as Id<"gdStages">);
          if (stage && "enemyIds" in stage) {
            const updatedEnemyIds = [...stage.enemyIds];
            updatedEnemyIds.push(enemyId);
            await ctx.db.patch(stageId as Id<"gdStages">, {
              enemyIds: updatedEnemyIds,
              updated: Date.now(),
            });
          }
        }

        createdEnemies.push(enemyId);
      }
    }

    return {
      imported: createdEnemies.length,
      enemies: createdEnemies,
    };
  },
});

