// Predefined damage types for Galaxy Defense
export const DAMAGE_TYPES = [
  "Fire",
  "Energy",
  "Electric",
  "Force-field",
  "Physical",
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];

