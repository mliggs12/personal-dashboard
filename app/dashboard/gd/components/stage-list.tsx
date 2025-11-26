"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";

import { StageCard } from "./stage-card";

interface StageListProps {
  stages: (Doc<"gdStages"> & { enemies?: Doc<"gdEnemies">[] })[];
  onEdit?: (stageId: Id<"gdStages">) => void;
  onDelete?: (stageId: Id<"gdStages">) => void;
}

export function StageList({ stages, onEdit, onDelete }: StageListProps) {
  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg mb-2">No stages yet</p>
        <p className="text-muted-foreground text-sm">
          Create your first stage to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <StageCard
          key={stage._id}
          stage={stage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

