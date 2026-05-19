"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useClientDate } from "@/hooks/useClientDate";

const GOAL_OZ = 96;
const QUICK_ADD_AMOUNTS = [8, 16, 24, 32];

export default function WaterCard() {
  const { isClient, timezone, today } = useClientDate();
  const addEntry = useMutation(api.waterLogEntries.create);
  const { toast } = useToast();

  const dayData = useQuery(
    api.waterLogEntries.dailyEntries,
    isClient ? { timestamp: dayjs(today).toISOString(), userTimezone: timezone } : "skip"
  );

  const consumed = dayData?.dayTotalConsumed ?? 0;
  const progressPct = Math.min((consumed / GOAL_OZ) * 100, 100);

  async function handleAdd(amount: number) {
    try {
      await addEntry({ amount });
      toast({ title: `+${amount} oz logged` });
    } catch {
      toast({ title: "Failed to log water", variant: "destructive" });
    }
  }

  return (
    <Card className="w-[260px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-4 w-4 text-blue-400" />
          Water
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold">{consumed}</span>
          <span className="text-sm text-muted-foreground mb-0.5">/ {GOAL_OZ} oz</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex gap-1.5">
          {QUICK_ADD_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              className="flex-1 text-xs px-0"
              onClick={() => handleAdd(amount)}
            >
              +{amount}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href="/dashboard/wellness"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </CardFooter>
    </Card>
  );
}
