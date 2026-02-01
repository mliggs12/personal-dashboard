"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "default";
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({
  name,
  color,
  size = "default",
  onRemove,
  className,
}: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-normal gap-1",
        size === "sm" && "px-1.5 py-0 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
