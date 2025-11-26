"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: string;
  multiplier?: 0.5 | 1.0;
  variant?: "weakness" | "resistance";
  className?: string;
}

function getTypeColorClasses(type: string, variant: "weakness" | "resistance"): string {
  const baseClasses = "border font-medium";
  
  // Map types to their in-game colors
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    Fire: {
      bg: "bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/50",
    },
    Energy: {
      bg: "bg-green-500/20",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-500/50",
    },
    Electric: {
      bg: "bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/50",
    },
    "Force-field": {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-300 dark:border-gray-600",
    },
    Physical: {
      bg: "bg-gray-500/20",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-500/50",
    },
  };

  const colors = colorMap[type] || {
    bg: variant === "weakness" ? "bg-primary/20" : "bg-secondary/20",
    text: variant === "weakness" ? "text-primary" : "text-secondary-foreground",
    border: variant === "weakness" ? "border-primary/50" : "border-secondary/50",
  };

  return cn(baseClasses, colors.bg, colors.text, colors.border);
}

export function TypeBadge({ type, multiplier, variant = "weakness", className }: TypeBadgeProps) {
  const displayText = multiplier !== undefined 
    ? `${type} (${multiplier === 1.0 ? "100%" : "50%"})`
    : `${type} (50%)`;

  return (
    <Badge
      variant="outline"
      className={cn(getTypeColorClasses(type, variant), className)}
    >
      {displayText}
    </Badge>
  );
}

