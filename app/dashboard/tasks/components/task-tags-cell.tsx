"use client";

import { useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { TagBadge } from "../../components/tasks/tag-badge";

interface TaskTagsCellProps {
  task: Doc<"tasks">;
}

export function TaskTagsCell({ task }: TaskTagsCellProps) {
  const tagIds = task.tagIds || [];
  const tags = useQuery(api.tags.getMany, { tagIds });

  if (!tags || tags.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[200px]">
      {tags.slice(0, 3).map((tag) => (
        <TagBadge key={tag._id} name={tag.name} color={tag.color} size="sm" />
      ))}
      {tags.length > 3 && (
        <Badge variant="secondary" className="rounded-sm px-1 text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
}
