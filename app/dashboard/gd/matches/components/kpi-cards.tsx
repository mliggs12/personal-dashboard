"use client";

import { useQuery } from "convex/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

import { formatLargeNumber } from "../lib/format";

export function KpiCards() {
  const summary = useQuery(api.gdMatches.summary);

  const items = [
    {
      label: "Matches",
      value: summary?.matches ?? 0,
      sub: summary ? `${summary.wins} wins` : undefined,
    },
    {
      label: "Win rate",
      value: `${summary?.winRate ?? 0}%`,
    },
    {
      label: "Best stage",
      value: summary?.bestStage ?? 0,
    },
    {
      label: "Total damage",
      value: summary ? formatLargeNumber(summary.totalDamage) : "0",
      sub: summary ? `avg HP ${summary.avgHp}%` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl md:text-3xl">
              {item.value}
            </CardTitle>
          </CardHeader>
          {item.sub && (
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {item.sub}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
