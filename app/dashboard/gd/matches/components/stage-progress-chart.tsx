"use client";

import { useQuery } from "convex/react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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

const chartConfig = {
  stage: {
    label: "Stage",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function StageProgressChart() {
  const matches = useQuery(api.gdMatches.list, { limit: 200 });
  const data = (matches ?? [])
    .slice()
    .sort((a, b) => a.playedAt - b.playedAt)
    .map((m) => ({
      date: new Date(m.playedAt).toLocaleDateString(),
      stage: m.stageNumber,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage over time</CardTitle>
        <CardDescription>Highest stage reached per match</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[240px] w-full"
        >
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="stage"
              stroke="var(--color-stage)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
