"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";

import {
  calculateStageResistances,
  calculateStageWeaknesses,
} from "../lib/weakness-calculator";

import { EnemyPreview } from "./enemy-preview";

interface StageCardProps {
  stage: Doc<"gdStages"> & { enemies?: Doc<"gdEnemies">[] };
  onEdit?: (stageId: Id<"gdStages">) => void;
  onDelete?: (stageId: Id<"gdStages">) => void;
}

export function StageCard({ stage, onEdit, onDelete }: StageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const enemies = stage.enemies || [];
  const weaknessSummary = calculateStageWeaknesses(enemies);
  const resistanceSummary = calculateStageResistances(enemies);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">Stage {stage.number}</CardTitle>
            <Badge variant={stage.difficulty === "elite" ? "default" : "secondary"}>
              {stage.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {enemies.length} {enemies.length === 1 ? "enemy" : "enemies"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(stage._id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(stage._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {(weaknessSummary || resistanceSummary) && (
          <div className="mt-2 flex flex-col gap-1">
            {weaknessSummary && (
              <span className="text-sm font-medium text-muted-foreground">
                {weaknessSummary}
              </span>
            )}
            {resistanceSummary && (
              <span className="text-sm font-medium text-muted-foreground">
                {resistanceSummary}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {enemies.length > 0 ? (
              enemies.map((enemy) => (
                <EnemyPreview key={enemy._id} enemy={enemy} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No enemies assigned</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

