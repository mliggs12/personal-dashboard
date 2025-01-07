"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  ounces: {
    label: "Ounces",
  },
  date: {
    label: "todayDate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface WaterProgressProps {
  currentOunces: number;
  goalOunces?: number;
}

function calculateWaterAngles(current: number, goal: number = 96) {
  const percentage = Math.min(current / goal, 1);
  const degrees = percentage * 360;
  return {
    startAngle: 90 - degrees, // Subtract from fixed endAngle
    endAngle: 90, // Fixed at top-right quadrant
  };
}

export default function WaterDailyProgressChart({
  currentOunces = 24,
  goalOunces = 96,
}: WaterProgressProps) {
  const { startAngle, endAngle } = calculateWaterAngles(
    currentOunces,
    goalOunces,
  );

  const chartData = [
    { date: "todayDate", ounces: currentOunces, fill: "var(--color-date)" },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Water Daily Progress</CardTitle>
        <CardDescription>{"todayDate"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="ounces"
              background
              cornerRadius={10}
            />
            <PolarRadiusAxis
              tick={false}
              tickLine={false}
              axisLine={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].ounces.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          of {goalOunces} Ounces
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex font-medium leading-none">
          Showing total ounces of water consumed today
        </div>
      </CardFooter>
    </Card>
  );
}
