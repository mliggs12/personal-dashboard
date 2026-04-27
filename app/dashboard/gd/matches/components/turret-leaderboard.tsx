"use client";

import { useQuery } from "convex/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@/convex/_generated/api";

import { formatLargeNumber } from "../lib/format";

const chartConfig = {
  damage: {
    label: "Damage",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TurretLeaderboard() {
  const rows = useQuery(api.gdMatches.turretLeaderboard, { limit: 8 });
  const data = (rows ?? []).map((r) => ({
    name: r.displayName.length > 14 ? `${r.displayName.slice(0, 14)}…` : r.displayName,
    damage: r.damage,
    avgDps: r.uses ? Math.round(r.dps / r.uses) : 0,
    uses: r.uses,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top turrets</CardTitle>
        <CardDescription>
          Total damage across all tracked matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[240px] w-full"
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 32 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={40}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => formatLargeNumber(Number(v))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === "damage"
                      ? [formatLargeNumber(Number(value)), "Damage"]
                      : [String(value), String(name)]
                  }
                />
              }
            />
            <Bar
              dataKey="damage"
              fill="var(--color-damage)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
