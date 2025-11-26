"use client";

import { Badge } from "@/components/ui/badge";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

import { TypeBadge } from "./type-badge";

interface EnemyPreviewProps {
  enemy: Doc<"gdEnemies">;
}

export function EnemyPreview({ enemy }: EnemyPreviewProps) {
  return (
    <Link href={`/dashboard/gd/enemies/${enemy._id}`}>
      <div className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{enemy.name}</span>
          {enemy.elite && (
            <Badge variant="outline" className="text-xs">
              Elite
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {enemy.weaknesses.map((weakness, idx) => (
            <TypeBadge
              key={idx}
              type={weakness.type}
              multiplier={weakness.multiplier}
              variant="weakness"
            />
          ))}
          {enemy.resistances.map((resistance, idx) => (
            <TypeBadge
              key={idx}
              type={resistance}
              variant="resistance"
            />
          ))}
        </div>
      </div>
    </Link>
  );
}

