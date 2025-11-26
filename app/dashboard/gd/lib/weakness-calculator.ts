import { Doc } from "@/convex/_generated/dataModel";

/**
 * Calculates the total weakness counts for all enemies in a stage
 * Returns a formatted string like "MORE: 4x Fire, 2x Energy, 2x Physical"
 */
export function calculateStageWeaknesses(
  enemies: Doc<"gdEnemies">[]
): string {
  if (enemies.length === 0) {
    return "";
  }

  // Count occurrences of each weakness type
  const weaknessCounts = new Map<string, number>();

  enemies.forEach((enemy) => {
    enemy.weaknesses.forEach((weakness) => {
      const count = weaknessCounts.get(weakness.type) || 0;
      weaknessCounts.set(weakness.type, count + 1);
    });
  });

  if (weaknessCounts.size === 0) {
    return "";
  }

  // Sort by count (descending), then by type name (ascending) for consistent ordering
  const sortedWeaknesses = Array.from(weaknessCounts.entries())
    .sort((a, b) => {
      // First sort by count (descending)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Then sort by type name (ascending)
      return a[0].localeCompare(b[0]);
    })
    .map(([type, count]) => `${count}x ${type}`);

  return `MORE: ${sortedWeaknesses.join(", ")}`;
}

/**
 * Calculates the total resistance counts for all enemies in a stage
 * Returns a formatted string like "LESS: 3x Fire, 1x Energy"
 */
export function calculateStageResistances(
  enemies: Doc<"gdEnemies">[]
): string {
  if (enemies.length === 0) {
    return "";
  }

  // Count occurrences of each resistance type
  const resistanceCounts = new Map<string, number>();

  enemies.forEach((enemy) => {
    enemy.resistances.forEach((resistance) => {
      const count = resistanceCounts.get(resistance) || 0;
      resistanceCounts.set(resistance, count + 1);
    });
  });

  if (resistanceCounts.size === 0) {
    return "";
  }

  // Sort by count (descending), then by type name (ascending) for consistent ordering
  const sortedResistances = Array.from(resistanceCounts.entries())
    .sort((a, b) => {
      // First sort by count (descending)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Then sort by type name (ascending)
      return a[0].localeCompare(b[0]);
    })
    .map(([type, count]) => `${count}x ${type}`);

  return `LESS: ${sortedResistances.join(", ")}`;
}

